"use client" 

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useState, useEffect } from "react";
import Link from "next/link";
import Spinner from "@/components/Spinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import { truncateContent } from "@/utils/functions"

import Footer from "@/components/Footer";

type Letter = {
  id: string
  content: string
  intended_recipient: string | null
}

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Root page of the site.
  Displays all letters

------------------------------------------------------------------------------------------------- 
*/

export default function Home() {

  const [letters, setLetters] = useState<Letter[]>([])
  const [responseOk, setResponseOk] = useState(false)  
  const [ErrorMessage, setErrorMessage] = useState(`
    Upgrading the database - will be offline and unable to retrieve any letters. 
    Please check back in a couple of hours.`)

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
        setErrorMessage(`Failed to load letters: ${data.error}. Please try again later.`)
      }

    } catch (err) {
      console.error('Network error:', err)
      setErrorMessage(`Network error: ${err}. Please try again later.`)
    }
  }

  useEffect(() => {
    loadAllLetters()
  }, []);

  function determineLetterDisplay() {

    if (responseOk === false) {
      return <div className="spinner-container">
                <Spinner />
              </div>

    } else if (letters.length === 0) {
      return <p>No letters</p>

    } else {
      return letters.map((letter) => (
        <Link 
          href={`/${letter.id}`}
          key={letter.id}
        >
          <div className="letter">
            {
              ( letter.intended_recipient === "" || letter.intended_recipient === null )? (
                <div className="
                  single-letter-content-no-recipient-on-display-page 
                  preserve-breaks
                  single-letter-on-display-page-margin-bottom
                ">
                  {truncateContent(letter.content)}
                </div>
              ) : (
                <>
                  <h2>
                    {letter.intended_recipient}
                  </h2>
                  <div className="
                    single-letter-content-container-with-recipient 
                    preserve-breaks 
                    single-letter-on-display-page-margin-bottom
                  ">
                    {truncateContent(letter.content)}
                  </div>
                </>
              )
            }
            
          </div>
        </Link>
      ))

    }

  }

  // -------------------------------------------------------------------------------------------------
  //     RETURN
  // -------------------------------------------------------------------------------------------------

  return (
    <>
      {
        ErrorMessage ? (
          <ErrorDisplay message={ErrorMessage} />
        ) : null
      }
      <div className="letter-display">
        { determineLetterDisplay() }
      </div>
      <Footer />
    </>
  );
}
