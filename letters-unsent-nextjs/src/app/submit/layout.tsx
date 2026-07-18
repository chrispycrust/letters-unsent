/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Letters Unsent—Release",
  description: "Write and submit your own letter",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Defines layout across all pages of website

------------------------------------------------------------------------------------------------- 
*/

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
