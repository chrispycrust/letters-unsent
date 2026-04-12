/** @jest-environment node */

import argon2 from "argon2"
import { DELETE, GET, POST, PUT } from "@/app/api/supabase/singleLetter/route"
import { moderateLetterForArchive } from "@/utils/guardian/moderateLetterForArchive"
import { createClient } from "@/utils/supabase/server"

jest.mock("argon2", () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
    hash: jest.fn(),
    argon2id: 2,
  },
}))

jest.mock("@/utils/guardian/moderateLetterForArchive", () => ({
  moderateLetterForArchive: jest.fn(),
}))

jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(),
}))

const mockedCreateClient = jest.mocked(createClient)
const mockedArgon2Verify = jest.mocked(argon2.verify)
const mockedModerateLetterForArchive = jest.mocked(moderateLetterForArchive)

describe("/api/supabase/singleLetter route", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedArgon2Verify.mockResolvedValue(true)
    mockedModerateLetterForArchive.mockResolvedValue({
      allowed: true,
      reason: "Allowed",
    })
  })

  it("GET returns a single letter array by id", async () => {
    const eq = jest.fn().mockResolvedValue({
      data: [{ id: "1", content: "Hello" }],
      error: null,
    })
    const select = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ select })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter?letterId=1")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      letter: [{ id: "1", content: "Hello" }],
    })
    expect(eq).toHaveBeenCalledWith("id", "1")
  })

  it("POST verifies a valid passphrase for a protected letter", async () => {
    const eq = jest.fn().mockResolvedValue({
      data: [{ id: "10", owner_passphrase_hash: "argon-hash-10" }],
      error: null,
    })
    const select = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ select })
    mockedCreateClient.mockResolvedValue({ from } as never)
    mockedArgon2Verify.mockResolvedValue(true)

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        letterId: "10",
        owner_passphrase: "correct-token",
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      verified: true,
    })
    expect(mockedArgon2Verify).toHaveBeenCalledWith("argon-hash-10", "correct-token")
  })

  it("POST temporarily locks verification after repeated failures", async () => {
    const eq = jest.fn().mockResolvedValue({
      data: [{ id: "lockout-1", owner_passphrase_hash: "argon-hash-lockout" }],
      error: null,
    })
    const select = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ select })
    mockedCreateClient.mockResolvedValue({ from } as never)
    mockedArgon2Verify.mockResolvedValue(false)

    let response: Response | null = null

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      response = await POST(
        new Request("http://localhost/api/supabase/singleLetter", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            letterId: "lockout-1",
            owner_passphrase: `wrong-${attempt}`,
          }),
        }),
      )
    }

    expect(response).not.toBeNull()
    expect(response?.status).toBe(429)
    expect(await response?.json()).toEqual({
      success: false,
      code: "VERIFICATION_RATE_LIMITED",
      error: "Too many attempts in a short time. Please wait a moment, then try again.",
    })
  })

  it("PUT requires owner passphrase proof", async () => {
    mockedCreateClient.mockResolvedValue({ from: jest.fn() } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        letterId: "edit-1",
        content: "Updated content",
      }),
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({
      success: false,
      code: "MISSING_PASSPHRASE",
      error: "We couldn’t verify your token.",
    })
  })

  it("PUT runs moderation before update and rejects disallowed edits", async () => {
    const selectEq = jest.fn().mockResolvedValue({
      data: [
        {
          id: "edit-2",
          content: "Current letter",
          intended_recipient: "Sam",
          author_name: "Casey",
          owner_passphrase_hash: "argon-hash-edit-2",
        },
      ],
      error: null,
    })
    const select = jest.fn().mockReturnValue({ eq: selectEq })
    const update = jest.fn()
    const from = jest.fn().mockReturnValue({ select, update })
    mockedCreateClient.mockResolvedValue({ from } as never)
    mockedArgon2Verify.mockResolvedValue(true)
    mockedModerateLetterForArchive.mockResolvedValue({
      allowed: false,
      reason: "Contains disallowed content.",
    })

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        letterId: "edit-2",
        owner_passphrase: "correct-token",
        content: "Disallowed edited content",
      }),
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body).toEqual({
      success: false,
      code: "MODERATION_BLOCKED",
      error: "We couldn’t accept this updated version under the archive’s safety guidelines.",
    })
    expect(mockedModerateLetterForArchive).toHaveBeenCalledWith({
      content: "Disallowed edited content",
      intended_recipient: "Sam",
      author_name: "Casey",
    })
    expect(update).not.toHaveBeenCalled()
  })

  it("PUT updates the existing row and sets updated_at when moderation passes", async () => {
    const selectEq = jest.fn().mockResolvedValue({
      data: [
        {
          id: "edit-3",
          content: "Current content",
          intended_recipient: "Sam",
          author_name: "Casey",
          owner_passphrase_hash: "argon-hash-edit-3",
        },
      ],
      error: null,
    })
    const select = jest.fn().mockReturnValue({ eq: selectEq })

    const updateSelect = jest.fn().mockResolvedValue({
      data: [
        {
          id: "edit-3",
          content: "Updated content",
          intended_recipient: "Jordan",
          author_name: "Casey",
          updated_at: "2026-04-03T10:15:00.000Z",
        },
      ],
      error: null,
    })
    const updateEq = jest.fn().mockReturnValue({ select: updateSelect })
    const update = jest.fn().mockReturnValue({ eq: updateEq })

    const from = jest.fn().mockReturnValue({ select, update })
    mockedCreateClient.mockResolvedValue({ from } as never)
    mockedArgon2Verify.mockResolvedValue(true)
    mockedModerateLetterForArchive.mockResolvedValue({
      allowed: true,
      reason: "Allowed",
    })

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        letterId: "edit-3",
        owner_passphrase: "correct-token",
        content: "Updated content",
        intended_recipient: "Jordan",
      }),
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      data: [
        {
          id: "edit-3",
          content: "Updated content",
          intended_recipient: "Jordan",
          author_name: "Casey",
          updated_at: "2026-04-03T10:15:00.000Z",
        },
      ],
    })
    expect(update).toHaveBeenCalledWith({
      content: "Updated content",
      intended_recipient: "Jordan",
      updated_at: expect.any(String),
    })
  })

  it("DELETE returns unauthorized when passphrase proof is invalid", async () => {
    const selectEq = jest.fn().mockResolvedValue({
      data: [{ id: "delete-1", owner_passphrase_hash: "argon-hash-delete-1" }],
      error: null,
    })
    const select = jest.fn().mockReturnValue({ eq: selectEq })
    const remove = jest.fn()
    const from = jest.fn().mockReturnValue({ select, delete: remove })
    mockedCreateClient.mockResolvedValue({ from } as never)
    mockedArgon2Verify.mockResolvedValue(false)

    const request = new Request("http://localhost/api/supabase/singleLetter?letterId=delete-1", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ owner_passphrase: "wrong-token" }),
    })

    const response = await DELETE(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({
      success: false,
      code: "INVALID_PASSPHRASE",
      error: "We couldn’t verify your token.",
    })
    expect(remove).not.toHaveBeenCalled()
  })

  it("DELETE removes a letter when passphrase proof is valid", async () => {
    const selectEq = jest.fn().mockResolvedValue({
      data: [{ id: "delete-2", owner_passphrase_hash: "argon-hash-delete-2" }],
      error: null,
    })
    const select = jest.fn().mockReturnValue({ eq: selectEq })

    const removeSelect = jest.fn().mockResolvedValue({
      data: [{ id: "delete-2" }],
      error: null,
    })
    const removeEq = jest.fn().mockReturnValue({ select: removeSelect })
    const remove = jest.fn().mockReturnValue({ eq: removeEq })

    const from = jest.fn().mockReturnValue({ select, delete: remove })
    mockedCreateClient.mockResolvedValue({ from } as never)
    mockedArgon2Verify.mockResolvedValue(true)

    const request = new Request("http://localhost/api/supabase/singleLetter?letterId=delete-2", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ owner_passphrase: "correct-token" }),
    })

    const response = await DELETE(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      data: [{ id: "delete-2" }],
    })
    expect(removeEq).toHaveBeenCalledWith("id", "delete-2")
  })
})
