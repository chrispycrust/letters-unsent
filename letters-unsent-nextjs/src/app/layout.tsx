/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata } from "next";
import { cormorant, lora, geist } from "@/styles/fonts/fonts"
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";


import "../styles/globals.css";
// import "../styles/debugging.css";

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
          <div>
            {children}
          </div>
          <Footer/>
        </main>
      </body>
    </html>
  );
}
