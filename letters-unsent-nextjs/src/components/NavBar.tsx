/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

// COMPONENTS

import Link from "next/link";

/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Navigation bar

-------------------------------------------------------------------------------------------------
*/

export default function NavBar() {
  return (
    <nav className="navbar">
      <Link href="/">Letters Unsent</Link>
      <ul className="navLinks">
        <li>
          <Link href="/submit">Release A Letter</Link>
        </li>
      </ul>
    </nav>
  );
};