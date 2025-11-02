"use client" 

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import NavBar from "@/components/NavBar";
import { useState, useEffect } from "react";
import Link from "next/link";

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

      <div className="body-exc-navbar">
        <div className="letterDisplay">
        
          {letters.length > 0 ? (

            letters.map((letter) => (

              <Link 
                href={`/${letter.id}`}
                key={letter.id}
              >
                <div className="letter">
                  <h2>{letter.intended_recipient}</h2>
                  <p>{letter.created_at}</p>
                  <p>{letter.content}</p>
                </div>
              </Link>
            
            ))
          ) : (
            <p>Loading letteers...</p>
          )}
        </div>
      </div>
    </div>
  );
}
