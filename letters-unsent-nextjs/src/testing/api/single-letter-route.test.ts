/** @jest-environment node */

import { DELETE, GET, PUT } from "@/app/api/supabase/singleLetter/route"
import { createClient } from "@/utils/supabase/server"

jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(),
}))

const mockedCreateClient = jest.mocked(createClient)

describe("/api/supabase/singleLetter route", () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  it("GET returns 400 when letterId is missing", async () => {
    mockedCreateClient.mockResolvedValue({ from: jest.fn() } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      success: false,
      error: "Invalid payload: missing required field `letterId`.",
    })
  })

  it("GET returns empty state when no letter exists for id", async () => {
    const eq = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    })
    const select = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ select })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter?letterId=missing")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      letter: [],
    })
  })

  it("GET returns 403 for permission denied", async () => {
    const eq = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "permission denied for table letter" },
    })
    const select = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ select })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter?letterId=1")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({
      success: false,
      error: "permission denied for table letter",
    })
  })

  it("GET returns 500 for db timeout", async () => {
    const eq = jest.fn().mockRejectedValue(new Error("Database timeout"))
    const select = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ select })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter?letterId=1")
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      success: false,
      error: "Database timeout",
    })
  })

  it("PUT updates a letter", async () => {
    const select = jest.fn().mockResolvedValue({
      data: [{ id: "1", content: "Updated content" }],
      error: null,
    })
    const eq = jest.fn().mockReturnValue({ select })
    const update = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ update })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "PUT",
      body: JSON.stringify({
        letterId: "1",
        content: "Updated content",
        intended_recipient: "Sam",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      data: [{ id: "1", content: "Updated content" }],
    })
    expect(update).toHaveBeenCalledWith({
      content: "Updated content",
      intended_recipient: "Sam",
    })
    expect(eq).toHaveBeenCalledWith("id", "1")
  })

  it("PUT returns 400 when letterId is missing", async () => {
    mockedCreateClient.mockResolvedValue({ from: jest.fn() } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "PUT",
      body: JSON.stringify({
        content: "Updated content",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      success: false,
      error: "Invalid payload: missing required field `letterId`.",
    })
  })

  it("PUT returns 400 when no update fields are provided", async () => {
    mockedCreateClient.mockResolvedValue({ from: jest.fn() } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "PUT",
      body: JSON.stringify({
        letterId: "1",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      success: false,
      error: "Invalid payload: at least one updatable field is required.",
    })
  })

  it("PUT returns 400 for malformed json", async () => {
    mockedCreateClient.mockResolvedValue({ from: jest.fn() } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "PUT",
      body: "{invalid-json",
      headers: { "content-type": "application/json" },
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      success: false,
      error: "Invalid payload: malformed JSON body.",
    })
  })

  it("PUT returns 403 when db denies permissions", async () => {
    const select = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "permission denied for table letter" },
    })
    const eq = jest.fn().mockReturnValue({ select })
    const update = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ update })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "PUT",
      body: JSON.stringify({
        letterId: "1",
        content: "Updated content",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({
      success: false,
      error: "permission denied for table letter",
    })
  })

  it("PUT returns 403 when auth/session is missing", async () => {
    mockedCreateClient.mockRejectedValue(new Error("Not authenticated"))

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "PUT",
      body: JSON.stringify({
        letterId: "1",
        content: "Updated content",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({
      success: false,
      error: "Not authenticated",
    })
  })

  it("PUT returns 404 when letter does not exist", async () => {
    const select = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    })
    const eq = jest.fn().mockReturnValue({ select })
    const update = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ update })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "PUT",
      body: JSON.stringify({
        letterId: "missing",
        content: "Updated content",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toEqual({
      success: false,
      error: "Letter not found.",
    })
  })

  it("DELETE removes a letter by id", async () => {
    const select = jest.fn().mockResolvedValue({
      data: [{ id: "1" }],
      error: null,
    })
    const eq = jest.fn().mockReturnValue({ select })
    const remove = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ delete: remove })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter?letterId=1", {
      method: "DELETE",
    })
    const response = await DELETE(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      data: [{ id: "1" }],
    })
    expect(eq).toHaveBeenCalledWith("id", "1")
  })

  it("DELETE returns 400 when letterId is missing", async () => {
    mockedCreateClient.mockResolvedValue({ from: jest.fn() } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter", {
      method: "DELETE",
    })
    const response = await DELETE(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      success: false,
      error: "Invalid payload: missing required field `letterId`.",
    })
  })

  it("DELETE returns 500 on db timeout", async () => {
    const select = jest.fn().mockRejectedValue(new Error("Database timeout"))
    const eq = jest.fn().mockReturnValue({ select })
    const remove = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ delete: remove })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter?letterId=1", {
      method: "DELETE",
    })
    const response = await DELETE(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      success: false,
      error: "Database timeout",
    })
  })

  it("DELETE returns 404 when letter does not exist", async () => {
    const select = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    })
    const eq = jest.fn().mockReturnValue({ select })
    const remove = jest.fn().mockReturnValue({ eq })
    const from = jest.fn().mockReturnValue({ delete: remove })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase/singleLetter?letterId=missing", {
      method: "DELETE",
    })
    const response = await DELETE(request)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toEqual({
      success: false,
      error: "Letter not found.",
    })
  })

  it("DELETE returns 403 when auth/session is missing", async () => {
    mockedCreateClient.mockRejectedValue(new Error("Not authenticated"))

    const request = new Request("http://localhost/api/supabase/singleLetter?letterId=1", {
      method: "DELETE",
    })
    const response = await DELETE(request)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({
      success: false,
      error: "Not authenticated",
    })
  })
})
