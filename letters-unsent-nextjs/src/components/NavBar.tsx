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
import { useEffect } from "react";

/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Navigation bar

-------------------------------------------------------------------------------------------------
*/

export default function NavBar() {

  const [ showModal, setShowModal ] = useState(false)
  const [ windowInnerWidth, setWindowInnerWidth ] = useState(window.innerWidth)

  useEffect(() => {

      const handleResize = () => {
        setWindowInnerWidth(window.innerWidth)
      }

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };

    }, []);
    
  return (
    <nav className="navbar">
      <Link href="/">Letters Unsent</Link>

      {
        windowInnerWidth < 550 ? (

          <>
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
          </>

        ) : (

          <div className="nav-links">
            <Link 
              href="/submit" 
            >
              Release A Letter
            </Link>
            <Link 
              href="/about" 
            >
              About & Contact
            </Link>
          </div>

        )
      }

    </nav>
  );
};