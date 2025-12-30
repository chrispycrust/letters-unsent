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
import EnvelopeClosedIcon from "../../public/icons/envelope-closed";

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
        className="button-change-modal"
      >
        <EnvelopeClosedIcon />
      </button>

      {
        showModal &&
          <NavigationModal 
            onClose={() => setShowModal(false)} 
          />
      }

    </nav>
  );
};