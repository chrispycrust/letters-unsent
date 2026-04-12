/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata } from "next";
import { cormorant, lora, geist } from "@/styles/fonts/fonts"

/* COMPONENTS */
import NavBar from "@/components/NavBar";

import "@/styles/globals.css";
// import "@/styles/debugging.css";

export const metadata: Metadata = {
  title: "Letters Unsent",
  description: "Home for words not received",
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
    <html lang="en">
      <body className={`${cormorant.variable} ${geist.variable} ${lora.variable}`}>
        <main>
          <NavBar/>
          {children}
        </main>
      </body>
    </html>
  );
}
