"use client" 

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useState, useEffect } from "react";

import { truncateContent, tagAIGeneratedLetters } from "@/utils/functions"

import Link from "next/link";
import Spinner from "@/components/Spinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import Footer from "@/components/Footer";
import AIGenTag from "@/components/AIGenTag";

type Letter = {
  id: string
  content: string
  intended_recipient: string | null
  relationship_type: string | null
  emotional_tone: string | null
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
                  {
                    (letter.relationship_type && letter.emotional_tone) &&
                      <br/>
                  }
                  <div className="
                    single-letter-content-no-recipient-on-display-page 
                    preserve-breaks
                    single-letter-on-display-page-margin-bottom
                  ">
                    {truncateContent(letter.content)}
                  </div>
                </>
              ) : (
                <>
                  {
                    (letter.relationship_type && letter.emotional_tone) &&
                      <br/>
                  }
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
