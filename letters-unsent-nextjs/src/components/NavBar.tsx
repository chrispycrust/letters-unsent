"use client"

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

// COMPONENTS

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import NavigationModal from "./NavigationModal";
import EnvelopeClosedIcon from "../../public/icons/envelope-closed";
import FeatherIcon from "../../public/icons/feather-icon";

/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Navigation bar

-------------------------------------------------------------------------------------------------
*/

export default function NavBar() {

  const pathname = usePathname()
  const [ showModal, setShowModal ] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const handleModalClose = useCallback(() => {
    setShowModal(false)
    menuButtonRef.current?.focus({ preventScroll: true })
  }, [])

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
      <Link
        href="/"
        aria-current={pathname === "/" ? "page" : undefined}
      >
        Letters Unsent
      </Link>

      {
         windowInnerWidth === null ? null : ( // avoid flicker / wrong initial layout
          windowInnerWidth < 550 ? (

            <>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setShowModal(true)}
                className="button-change-modal"
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={showModal}
                aria-controls="navigation-menu"
              >
                <EnvelopeClosedIcon />
              </button>

              {
                showModal &&
                  <NavigationModal 
                    onClose={handleModalClose}
                    currentPath={pathname}
                  />
              }
            </>

          ) : (

            <div className="nav-links">
              <Link 
                href="/submit"
                aria-current={pathname === "/submit" ? "page" : undefined}
              >
                Release A Letter
              </Link>
              <FeatherIcon />
              <Link 
                href="/about"
                aria-current={pathname === "/about" ? "page" : undefined}
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
