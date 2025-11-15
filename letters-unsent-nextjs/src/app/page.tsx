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

type Letter = {
  intendedRecipient: string;
  createdAt: Date;
  content: string;
  authorName: string;
}

export default function Home() {

  const [letters, setLetters] = useState([])  

  async function loadAllLetters() {
    try {

      const res = await fetch("/api/supabase", { 
        method: "GET" 
      })

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

  useEffect(() => {
    loadAllLetters()
  }, []);

  return (
    <div>

      <NavBar />

      <div className="body-exc-navbar">
        <div className="letterDisplay">

          {
            letters.length === 0 ? (
              <p>No letters</p>
            ) : (

              letters.map((Letter) => (
                <Link 
                  href={`/${Letter.id}`}
                  key={Letter.id}
                >
                  <div className="letter">
                    <h2>{Letter.intended_recipient}</h2>
                    <p>{Letter.created_at}</p>
                    <p>{Letter.content}</p>
                  </div>
                </Link>
              ))
            )
          }

        </div>
      </div>

    </div>
  );
}
