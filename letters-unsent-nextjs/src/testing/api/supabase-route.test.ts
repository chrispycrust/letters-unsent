/** @jest-environment node */

import { GET, POST } from "@/app/api/supabase/route"
import { createClient } from "@/utils/supabase/server"

jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(),
}))

const mockedCreateClient = jest.mocked(createClient)

describe("/api/supabase route", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("GET returns letters in descending created order", async () => {
    const order = jest.fn().mockResolvedValue({
      data: [{ id: "1", content: "hello" }],
      error: null,
    })
    const select = jest.fn().mockReturnValue({ order })
    const from = jest.fn().mockReturnValue({ select })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      letters: [{ id: "1", content: "hello" }],
    })
    expect(from).toHaveBeenCalledWith("letter")
    expect(select).toHaveBeenCalledTimes(1)
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false })
  })

  it("GET returns an empty array when db data is null", async () => {
    const order = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    })
    const select = jest.fn().mockReturnValue({ order })
    const from = jest.fn().mockReturnValue({ select })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ success: true, letters: [] })
  })

  it("GET returns 403 when db denies permissions", async () => {
    const order = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "permission denied for table letter" },
    })
    const select = jest.fn().mockReturnValue({ order })
    const from = jest.fn().mockReturnValue({ select })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({
      success: false,
      error: "permission denied for table letter",
    })
  })

  it("GET returns 500 when db call times out", async () => {
    const order = jest.fn().mockRejectedValue(new Error("Database timeout"))
    const select = jest.fn().mockReturnValue({ order })
    const from = jest.fn().mockReturnValue({ select })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      success: false,
      error: "Database timeout",
    })
  })

  it("GET returns 403 when auth/session is missing", async () => {
    mockedCreateClient.mockRejectedValue(new Error("Not authenticated"))

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({
      success: false,
      error: "Not authenticated",
    })
  })

  it("POST creates a letter", async () => {
    const select = jest.fn().mockResolvedValue({
      data: [{ id: "new-1", content: "Draft", intended_recipient: "Sam" }],
      error: null,
    })
    const insert = jest.fn().mockReturnValue({ select })
    const from = jest.fn().mockReturnValue({ insert })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase", {
      method: "POST",
      body: JSON.stringify({
        content: "Draft",
        intended_recipient: "Sam",
        author_name: "Casey",
        created_at: "2026-03-10T00:00:00.000Z",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      success: true,
      data: [{ id: "new-1", content: "Draft", intended_recipient: "Sam" }],
    })
    expect(from).toHaveBeenCalledWith("letter")
    expect(insert).toHaveBeenCalledWith([
      {
        content: "Draft",
        intended_recipient: "Sam",
        author_name: "Casey",
        created_at: "2026-03-10T00:00:00.000Z",
      },
    ])
  })

  it("POST returns 400 for invalid payload", async () => {
    const from = jest.fn()
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase", {
      method: "POST",
      body: JSON.stringify({
        intended_recipient: "Sam",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      success: false,
      error: "Invalid payload: `content` and `intended_recipient` are required.",
    })
    expect(from).not.toHaveBeenCalled()
  })

  it("POST returns 400 for malformed json", async () => {
    mockedCreateClient.mockResolvedValue({ from: jest.fn() } as never)

    const request = new Request("http://localhost/api/supabase", {
      method: "POST",
      body: "{invalid-json",
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      success: false,
      error: "Invalid payload: malformed JSON body.",
    })
  })

  it("POST returns 403 on permission denied", async () => {
    const select = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "permission denied for table letter" },
    })
    const insert = jest.fn().mockReturnValue({ select })
    const from = jest.fn().mockReturnValue({ insert })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase", {
      method: "POST",
      body: JSON.stringify({
        content: "Draft",
        intended_recipient: "Sam",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({
      success: false,
      error: "permission denied for table letter",
    })
  })

  it("POST returns 500 on db timeout", async () => {
    const select = jest.fn().mockRejectedValue(new Error("Database timeout"))
    const insert = jest.fn().mockReturnValue({ select })
    const from = jest.fn().mockReturnValue({ insert })
    mockedCreateClient.mockResolvedValue({ from } as never)

    const request = new Request("http://localhost/api/supabase", {
      method: "POST",
      body: JSON.stringify({
        content: "Draft",
        intended_recipient: "Sam",
      }),
      headers: { "content-type": "application/json" },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      success: false,
      error: "Database timeout",
    })
  })
})
