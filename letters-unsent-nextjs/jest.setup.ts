import { jest } from "@jest/globals"

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
