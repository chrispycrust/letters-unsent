"use client";

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import GuardianPanel from "@/components/LetterSubmit/GuardianPanel";
import VisitorPanel from "@/components/LetterSubmit/VisitorPanel";
import { useEffect, useState } from "react";

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Letter submission page

------------------------------------------------------------------------------------------------- 
*/

export default function Submit() {

  const [coveMessage, setCoveMessage] = useState('');
  const [visitorInput, setVisitorInput ] = useState("");

  // immediately on page load, guardian greets the visitor
  useEffect(() => {

    localStorage.setItem("visitCount", "1");

    async function greetVisitor() {

      // Step 1: Send visitCount
      const visitCount = localStorage.getItem("visitCount")
      const res = await fetch(`/api/guardian?&visitCount=${visitCount}`)

      // Step 2: Fetch Cove's message
      const data = await res.json()
      setCoveMessage(data.output)
    }
    greetVisitor()

  }, []);

  async function handleSubmit(e) {
    e.preventDefault() // stops the default page reload

    console.log("Visitor input:", visitorInput)

    // fetch Cove's message in response to visitorInput
    const res = await fetch("/api/guardian/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ visitorInput })
    })

    // update Cove's message with new response
    const data = await res.json()
    setCoveMessage(data.output)

    // reset visitor input to blank
    setVisitorInput("")
  }

  return (
    <div>

        <h1>Submit a letter</h1>

        <GuardianPanel
          message={coveMessage}
        />

        <VisitorPanel
          visitorInput={visitorInput}
          setVisitorInput={setVisitorInput}
          handleSubmit={handleSubmit}
        />

    </div>
  );
}
