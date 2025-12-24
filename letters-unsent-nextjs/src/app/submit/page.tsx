"use client";

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata } from "next";
import GuardianPanel from "@/components/LetterSubmit/GuardianPanel";
import VisitorPanel from "@/components/LetterSubmit/VisitorPanel";
import { useEffect, useState } from "react";
import { guardianSystemPrompt } from "@/utils/guardian/systemPrompt";
import ErrorDisplay from "@/components/ErrorDisplay";

// export const metadata: Metadata = {
//   title: "Release a letter",
//   description: "Write then submit your own letter to the archive",
// };

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Letter submission page

------------------------------------------------------------------------------------------------- 
*/

export default function Submit() {

  const [coveMessage, setCoveMessage] = useState('');
  const [visitorInput, setVisitorInput ] = useState("");
  const [conversation, setConversation] = useState([
    {
        role: "system",
        content: guardianSystemPrompt // not sure if I should be calling the system prompt from client?
    },
  ]);

  const [responseOk, setResponseOk] = useState(false)
  const [ErrorMessage, setErrorMessage] = useState("")

  // immediately on page load, guardian greets the visitor
  useEffect(() => {

    async function greetVisitor() {

      localStorage.setItem("visitCount", "1");
      localStorage.setItem("letterDraft", "hey you"); // without formatting

      // Step 1: Send visitCount and letterDraft
      const visitCount = localStorage.getItem("visitCount")

      try {
        const res = await fetch(`/api/guardian?&visitCount=${visitCount}`)

        if (res.ok === true) {
          setResponseOk(true);
        }

        // Step 2: Fetch Cove's message
        const data = await res.json()

        if (res.ok) {
          setCoveMessage(data.output)
        } else {
          console.error('Server error', data.error)
          setErrorMessage(`Server error: ${data.error}`)
        }

      } catch (err) {
        console.error('Network error:', err)
        setErrorMessage(`Network error: ${err}`)
      }

    }
    greetVisitor()

  }, []);

  async function handleSubmit(e) {
    e.preventDefault() // stops the default page reload

    setResponseOk(false);

    const updatedConversation = [...conversation, { role: "user", content: visitorInput }]

    try {

      // fetch Cove's message in response to visitorInput
      const res = await fetch("/api/guardian/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify( {updatedConversation} )
      })

      if (res.ok === false) {
        setCoveMessage("")
      } else {
        setResponseOk(true);
      }

      // update Cove's message with new response
      const data = await res.json()
      
      if (res.ok) {
        setConversation([...updatedConversation, { role: "assistant", content: data.output }])
        setCoveMessage(data.output)
      } else {
        console.error('Failed to load response from API:', data.error)
        setErrorMessage(`Failed to load response from API: ${data.error}`)
      }
      
      // reset visitor input to blank
      setVisitorInput("")

    } catch (err) {
      console.error('Network error:', err)
      setErrorMessage(`Network error: ${err}`)
    }

  }

  return (
      <div className="submit-container">
          <ErrorDisplay 
            message={ErrorMessage}
          />

          <GuardianPanel
            message={coveMessage}
            responseStatus={responseOk}
          />

          <VisitorPanel
            visitorInput={visitorInput}
            setVisitorInput={setVisitorInput}
            handleSubmit={handleSubmit}
          />
      </div>
  );
}