"use client"

import { useState } from "react"
import Link from "next/link"

/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Footer containing information

-------------------------------------------------------------------------------------------------
*/

export default function Footer() {

    const [ showModal, setShowModal ] = useState(false)

    
    return (
        <footer>
            <div className="footer-nav-links">
                <p>
                    <Link href="/">Letters Unsent</Link> (v1.0)
                </p>
                <p>Release 2026</p>
            </div>
            <div className="footer-nav-links">
                <p>
                    <Link 
                        href="/submit" 
                    >
                        Release A Letter
                    </Link>
                </p>
                
                <p>
                    <Link 
                        href="/about" 
                    >
                        About & Contact
                    </Link>
                </p>
                
            </div>
        </footer>
    )
}