"use client" 

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useState, useEffect } from "react";
import Link from "next/link";
import Spinner from "@/components/Spinner";

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Root page of the site.
  Displays all letters

------------------------------------------------------------------------------------------------- 
*/

export default function Home() {

  const [letters, setLetters] = useState([])
  const [responseOk, setResponseOk] = useState(false)  

  async function loadAllLetters() {
    try {

      const res = await fetch("/api/supabase", { 
        method: "GET" 
      })

      if (res.ok === true) {
        setResponseOk(true)
      }

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

  function determineLetterDisplay() {

    if (responseOk === false) {
      return <Spinner />
    } else if (letters.length === 0) {
      return <p>No letters</p>
    } else {
      return letters.map((Letter) => (
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
    }

  }

  return (
    <div>

      <div className="body-exc-navbar">
        <div className="letterDisplay">

          { determineLetterDisplay() }

        </div>
      </div>

    </div>
  );
}
