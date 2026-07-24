"use client" 

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useState, useEffect } from "react";
import Link from "next/link";

import type { Letter } from "@/types/letter";

import { truncateContent, tagAIGeneratedLetters } from "@/utils/functions"
import ErrorDisplay from "@/components/ErrorDisplay";
import Footer from "@/components/Footer";
import AIGenTag from "@/components/AIGenTag";
import RouteLoading from "@/components/RouteLoading";

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
  const [ErrorMessage, setErrorMessage] = useState("")

  async function loadAllLetters() {
    try {

      const res = await fetch("/api/supabase", { 
        method: "GET" 
      })
      
      const data = await res.json()

      if (data.success) {
        setLetters(data.letters)
        setResponseOk(true)
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
      return <RouteLoading />

    } else {
      return letters.map((letter) => (
        <Link 
          href={`/letters/${letter.id}`}
          key={letter.id}
        >
          <div
            className="meta-data-container"
          >
            {
              tagAIGeneratedLetters(letter.id) &&
                <div>
                  <AIGenTag />
                </div>
            }
            {
              ( 
                letter.relationship_type && letter.emotional_tone ) ? (
                  <div
                    className="contextual-tags-container"
                    title="These are contextual tags to demonstrate the range of relationship types and emotional tones welcome on the website.
                        This feature will not appear on your submission just yet."
                  >
                    <span>{letter.relationship_type} · <i>{letter.emotional_tone}</i></span>
                  </div>
                ) : (
                  <></>
                )
            } 
          </div>
          
          <div className="letter">
            {
              
              ( !letter.intended_recipient )? (
                <>
                  <div className="
                    single-letter-content-container-with-recipient
                    preserve-breaks
                    single-letter-on-display-page-margin-bottom
                  ">
                    {truncateContent(letter.content)}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="letter-recipient-heading">
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
      <h1 className="sr-only">Letters archive</h1>
      {
        ErrorMessage ? (
          <ErrorDisplay message={ErrorMessage} />
        ) : 
        <div className="letter-display">
          { determineLetterDisplay() }
        </div>
      }
      <Footer />
    </>
  );
}
