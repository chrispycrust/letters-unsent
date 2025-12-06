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
      <div className="nav-links">
        <div>
          <Link href="/submit">Release A Letter</Link>
        </div><div>
          <Link href="/about">About</Link>
        </div>
      </div>
    </nav>
  );
};