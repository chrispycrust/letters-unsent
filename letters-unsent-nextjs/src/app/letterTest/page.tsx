//
// TEST PAGE: RETRIEVE ALL LETTERS
//

import {Letter} from "@prisma/client"; // Prisma generates Letter based on schema
import prisma from "../../lib/prisma";

// interface HomeProps {
//     letters: Letter[]; 
//   }

export default async function Home() {
    // Fetch data directly inside the async component
  const letters: Letter[] = await prisma.letter.findMany();
  return (
            <main>
                {
                    letters.length > 0 ? (

                        letters.map((letter: Letter) => (
                            <div key={letter.id}>
                                <p>Recipient: {letter.recipient ? letter.recipient : "anon"}</p>
                                <p>Content: {letter.content}</p>
                            </div>
                        ))

                    ) : (

                        <p> no letters to display</p>

                    )
                }
            
        </main>
  );
}

// // Fetch data on the server side
// export async function getServerSideProps() {
//     const letters: Letter[] = await prisma.letter.findMany();
    
//     return {
//       props: {
//         letters
//       },
//     };
//   }