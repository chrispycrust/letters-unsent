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
                <p>Letters Unsent (v1.0)</p>
                <p>2025-present</p>
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