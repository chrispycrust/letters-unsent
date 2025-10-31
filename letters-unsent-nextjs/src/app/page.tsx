"use client" 

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import NavBar from "@/components/NavBar";
import { useState, useEffect } from "react";

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Root page of the site.
  Displays all letters

------------------------------------------------------------------------------------------------- 
*/

export default function Home() {

  const [letters, setLetters] = useState([])  

  useEffect(() => {

    async function loadAllLetters() {

      try {
        const res = await fetch("/api/supabase", { method: "GET" })
        const data = await res.json()
        if (data.success) {
          setLetters(data.letters)
        } else {
          console.error('Failed to load letters:', data.error)
        }
      } catch (err) {
        console.error('Network error:', err)
      }
    }

    loadAllLetters()

  }, []);

  return (
    <div>

      <NavBar />

      <ul className="letterDisplay">
        {letters.length > 0 ? (
          letters.map((letter) => (
          <li 
            className="letter"
            key={letter.id}
          >

            <div>
              <h2>{letter.intended_recipient}</h2>
              <p>{letter.created_at}</p>
              <p>{letter.content}</p>
            </div>
          </li>
          
        ))
        ) : (
          <p>Loading letteers...</p>
        )}
      </ul>

    </div>
  );
}
