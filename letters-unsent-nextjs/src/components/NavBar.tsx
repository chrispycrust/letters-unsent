"use client"

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

// COMPONENTS

import Link from "next/link";
import { useState } from "react";
import NavigationModal from "./NavigationModal";

/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Navigation bar

-------------------------------------------------------------------------------------------------
*/

export default function NavBar() {

  const [ showModal, setShowModal ] = useState(false)

  return (
    <nav className="navbar">
      <Link href="/">Letters Unsent</Link>
      
        <button
          type="button"
          onClick={() => setShowModal(true)}
        >
          nav links
        </button>

        {
          showModal &&
            <NavigationModal 
              onClose={() => setShowModal(false)} 
            />
        }

      {/* <div className="nav-links">
        <div>
          <Link href="/submit">Release A Letter</Link>
        </div><div>
          <Link href="/about">About</Link>
        </div>
      </div> */}

    </nav>
  );
};