import React from "react";

jest.mock("next/link", () => {
  return function MockedLink({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return React.createElement("a", { href, ...rest }, children);
  };
});
