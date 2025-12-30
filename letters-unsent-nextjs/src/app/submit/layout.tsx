/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Letters Unsent—Release",
  description: "Write and submit your own letter",
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
