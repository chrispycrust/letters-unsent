'use client';

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
  
  
  “Thank you for being here.”  
  (1s delay)  
  “Let’s begin with your letter…”  
  (1s delay)  
  “What would you like to say?”
  

------------------------------------------------------------------------------------------------- 
*/

export default function Submit() {

  const [coveMessage, setCoveMessage] = useState('')

  useEffect(() => {
    async function fetchCoveMessage() {
      const res = await fetch("/api/guardian")
      const data = await res.json()
      setCoveMessage(data.output)
    }
    fetchCoveMessage()
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
