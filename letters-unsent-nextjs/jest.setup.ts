import { jest } from "@jest/globals"

const mockRouterPush = jest.fn()

;(globalThis as { __mockRouterPush?: typeof mockRouterPush }).__mockRouterPush = mockRouterPush

if (typeof Element !== "undefined") {
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: jest.fn(),
  })

  Object.defineProperty(Element.prototype, "scrollTo", {
    configurable: true,
    value: jest.fn(),
  })
}

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

jest.mock("next/link", () => {
  const React = require("react") as typeof import("react")

  return function MockedLink({
    href,
    children,
    ...rest
  }: {
    href: string | { pathname?: string }
    children: import("react").ReactNode
  }) {
    const resolvedHref = typeof href === "string" ? href : href?.pathname ?? ""
    return React.createElement("a", { href: resolvedHref, ...rest }, children)
  }
})
