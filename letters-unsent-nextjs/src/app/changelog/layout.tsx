/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: `Letters Unsent—Changelog`,
    description: "Tracks additions made over time",
  };


/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Defines layout for About page

------------------------------------------------------------------------------------------------- 
*/

export default function ChangelogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
