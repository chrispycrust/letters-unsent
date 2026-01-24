"use client";

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useState, useRef } from "react";
import { guardianSystemPrompt } from "@/utils/guardian/systemPrompt";

/* COMPONENTS */
import ErrorDisplay from "@/components/ErrorDisplay";
import GuardianPanel from "@/components/LetterSubmit/GuardianPanel";
import VisitorPanel from "@/components/LetterSubmit/VisitorPanel";

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Letter submission page

------------------------------------------------------------------------------------------------- 
*/

export default function Submit() {

  const [coveMessage, setCoveMessage] = useState("");
  const [visitorInput, setVisitorInput ] = useState("");
  const [conversation, setConversation] = useState([
    {
        role: "system",
        content: guardianSystemPrompt // not sure if I should be calling the system prompt from client?
    },
  ]);

  const [responseOk, setResponseOk] = useState(false)
  const [ErrorMessage, setErrorMessage] = useState("")
  const [conversationStart, setConversationStart] = useState(false); // "start conversation" button
  const ref = useRef<HTMLButtonElement | null>(null)

  async function greetVisitor() {

    // remove button if element at node exists 
    if (ref.current !== null) {
      ref.current.remove();
    } else {
      console.log("Element not found");
      // setErrorMessage("Button to start conversation not found")
    }

    setConversationStart(true);

    // activate emotional memory for Cove
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

          {
            ErrorMessage ? (
              <ErrorDisplay message={ErrorMessage} />
            ) : null
          }

          {
            (conversationStart === true) ? (
              <>  
                <div className="guardian-panel-container">
                  <GuardianPanel
                    message={coveMessage}
                    responseStatus={responseOk}
                  />
                </div>

                  <VisitorPanel
                    visitorInput={visitorInput}
                    setVisitorInput={setVisitorInput}
                    handleSubmit={handleSubmit}
                  />
              </>
            ) : (
              <div>
                <button
                  id="conversation-start-button"
                  type="button" 
                  onClick={greetVisitor}
                  className="start-conversation-button"
                >
                  Start conversation
                </button>
                <p
                  className="submission_note"
                >Submissions are not open yet (you'll get a warning at the end advising that something went wrong).</p>
              </div>
            )
          }

      </div>
  
  );
}