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
import { cormorant } from "@/styles/fonts/fonts"

import Footer from "@/components/Footer";

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
  const [ErrorMessage, setErrorMessage] = useState("")

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
      return letters.map((Letter) => (
        <Link 
          href={`/${Letter.id}`}
          key={Letter.id}
        >
          <div className="letter">
            {
              ( Letter.intended_recipient === "" || Letter.intended_recipient === null )? (
                <div className="
                  single-letter-content-no-recipient-on-display-page 
                  preserve-breaks
                  single-letter-on-display-page-margin-bottom
                ">
                  {truncateContent(Letter.content)}
                </div>
              ) : (
                <>
                  <h2>
                    {Letter.intended_recipient}
                  </h2>
                  <div className="
                    single-letter-content-container-with-recipient 
                    preserve-breaks 
                    single-letter-on-display-page-margin-bottom
                  ">
                    {truncateContent(Letter.content)}
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
