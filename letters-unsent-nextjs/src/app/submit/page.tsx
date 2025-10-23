"use client";

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import GuardianPanel from "@/components/LetterSubmit/GuardianPanel";
import { useEffect, useState } from "react";

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Letter submission page

------------------------------------------------------------------------------------------------- 
*/

export default function Submit() {

  const [coveMessage, setCoveMessage] = useState('');

  useEffect(() => {

    localStorage.setItem("visitCount", "1");

    async function greetVisitor() {

      // Step 1: Send visitCount
      const visitCount = localStorage.getItem("visitCount")
      const res = await fetch(`/api/guardian?visitCount=${visitCount}`)

      // Step 2: Fetch Cove's message
      const data = await res.json()
      setCoveMessage(data.output)
    }
    greetVisitor()

  }, []);

  return (
    <div>
        <h1>Submit a letter</h1>

        <GuardianPanel
          message={coveMessage}
        />
    </div>
  );
}
