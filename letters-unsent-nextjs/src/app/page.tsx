/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import styles from "./page.module.css";
import { createClient } from '../utils/supabase/server'
import { cookies } from 'next/headers'

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Root page of the site.
  Displays all letters

------------------------------------------------------------------------------------------------- 
*/

export default async function Home() {

  const supabase = await createClient()

  const { data: letters, error } = await supabase.from('letter').select()

  if (error) {
    console.error("Supabase error:", error)
  }

  return (
    <div>

      <ul>
        {letters?.map((letter) => (
          <li key={letter.id}>

            <div>
              <h2>{letter.intendedRecipient}</h2>
              <p>{letter.created_at}</p>
              <p>{letter.content}</p>
            </div>
          </li>
          
        ))}
      </ul>

    </div>
  );
}
