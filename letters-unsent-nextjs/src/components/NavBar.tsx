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

  // initial null state for inner width of a window set to null to account for scenario where: 
  // window hasn't been measured yet
  // otherwise window.innerWidth will never resolve to null or undefined
  const [ windowInnerWidth, setWindowInnerWidth ] = useState<number | null>(null)


  useEffect(() => {
      const handleResize = () => {
        setWindowInnerWidth(window.innerWidth)
      }

      handleResize()

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };

    }, []);
    
  return (
    <nav className="navbar">
      <Link href="/">Letters Unsent</Link>

      {
         windowInnerWidth === null ? null : ( // avoid flicker / wrong initial layout
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
        )
      }

    </nav>
  );
};