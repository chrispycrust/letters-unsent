/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: `Letters Unsent—About`,
    description: "About this platform",
  };


/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Defines layout for About page

------------------------------------------------------------------------------------------------- 
*/

export default function AboutLayout({
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
