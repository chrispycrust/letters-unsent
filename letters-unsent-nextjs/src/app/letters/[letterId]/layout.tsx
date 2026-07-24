/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: `Letters Unsent—Letter`,
    description: "About this platform",
  };


/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Defines layout for About page

------------------------------------------------------------------------------------------------- 
*/

export default function SingleLetterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="single-letter-display-area">
        <h1 className="sr-only">Letter</h1>
        {children}
      </div>
      <Footer />
    </>
  );
}
