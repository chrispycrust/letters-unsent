/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import Link from "next/link"

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Defines layout across all pages of website

------------------------------------------------------------------------------------------------- 
*/


export default function About() {
    return (
        <div className="about-section">
            <section >
                <article>
                <h1 className="about-section-h1">
                    About Letters Unsent
                </h1>
                <h3 className="about-section-h3">
                    <i>A home for words never received</i>
                </h3>
                <p>
                    The inspiration for this platform was sparked by Esther Perel whose <Link href="https://www.estherperel.com/blog/ull-introduction">perspective </Link> 
                    made me more aware of the release and clarity that writing can bring, even when the letter remains unsent. 
                </p><p>
                    There are already multiple other places where you can go to release unsent things: 
                </p>

                <ul>
                    <li>
                        <Link href="/">this reddit thread</Link>
                    </li><li>
                        <Link href="https://theunsentproject.com/#">The Unsent Project</Link>
                    </li><li>
                        <Link href="/">multiple other instagram accounts</Link>
                    </li>
                </ul>
                <p>
                    I wanted to contribute to the available platforms for these reasons:
                </p>
                <ul>
                    <li>
                        I wanted to give a home to the emotional worlds of others and build it the way I&apos;d want a home for letters to look 
                        (refer to &quot;Roadmap & Features&quot; section below for more.)
                    </li><li>
                        While I deeply enjoy and admire <Link href="https://theunsentproject.com/#">The Unsent Project</Link>, the website focuses on unsent texts and in a romantic context. 
                        I wanted to honour a wider range of human experience - love in all its forms as well as grief, gratitude, anger, regret, bitterness, for example.
                    </li><li>
                        And finally, in a time where there seems to be a preoccupation on optimisation and brevity,
                        there&apos;s something uniquely powerful about the letters inviting full attention. It requires more effort - but it&apos;s also likely to offer more reward.
                    </li>
                </ul>
                <p>
                    I hope people find comfort in reading these letters or sharing their own, knowing that others, too, have words left unspoken.
                </p>
                </article>
            </section>

            {/* -------------------------------------------------------- */}

            <section>
                <h2>
                    Submission Guidelines
                </h2>
                <p>
                    I want to honour letters of a diverse range of content and tones on this website. However, this is also a public space. You cannot:
                </p>
                <ul>
                    <li>
                        publicly share identifying sensitive details without consent (for example: what appears to be full names, addresses, phone numbers, emails etc)
                    </li><li>
                        explicit sexual content with anatomical detail intended to arouse or excite (pornographic material) - there are other platforms for that already
                    </li><li>
                        descriptions of non-consensual activity
                    </li><li>
                        graphic descriptions of violent or traumatic detail
                    </li><li>
                        hate speech or extremist praise
                    </li><li>
                        suicidal intentions or thoughts or self-harm instructions
                    </li><li>
                        any of the above involving minors
                    </li><li>
                        any combination of the above
                    </li>
                </ul>
                <p>Attempted submissions of this type of content will be prevented.

                </p><p>
                    Please reach out to me if you come across these situations (refer to &quot;Contact&quot; section below):
                </p>
                <ul>
                    <li>
                        If you&apos;re convinced your letter doesn&apos;t violate any of the above guidelines but you still have issues submitting.
                    </li><li>
                        If you read a letter and you think it should not be displayed publicly.
                    </li><li>
                        If you&apos;re convinced any of the disallowed content above should be reconsidered.
                    </li>
                </ul>
            </section>

            {/* -------------------------------------------------------- */}

            <section>
                <h2>
                    Privacy
                </h2>
                <p>
                    Anonymity and consent is highly important.
                    None of your details are stored on this website (including conversations with OpenAI&apos;s model on the submission form) other than what you choose to share. 
                    Nothing is tracked.
                </p>
                <p>
                    That said, for anonymity to work without gathering any visitor data, this means there is no way right now to prove a letter is yours.
                    Please don&apos;t share anything on this website if you think you might want to edit or delete it later. 
                    I won&apos;t delete or edit anything without proof.
                </p>
                <p>
                    Ability to edit and delete anonymously will be worked on in the next iteration. (See &quot;Roadmap & Features&quot; section below.)
                </p>
            </section>

            {/* -------------------------------------------------------- */}

            <section>
                <h2>
                    Roadmap & Features
                </h2>
                <p>
                    I&apos;m currently expanding the ability to <strong>update</strong> and <strong>delete</strong> submitted letters anonymously in v1.1.
                </p>
                <p>
                    Suggestions, comments or feedback for this platform are welcome—please reach out to me via the contact below.
                </p>
            </section>
            
            {/* -------------------------------------------------------- */}

            <section
                id="contact"
            >
                <h2>
                    Contact
                </h2>
                <p>
                    Developer but still an artist at heart, and writer of several letters myself. 
                    You can find out more about me on <Link href="https://chrispycrust.notion.site/Thought-Stack-0253a7f5960044f482fb53db397929ec">my personal website here</Link>.
                </p>
                <p>
                    If you&apos;d like to get in touch about anything related to this website here - you can use the following ways: 
                </p>
                <ul>
                    <li>
                        <Link href="https://tally.so/r/gDdeBD">anonymous contact form</Link>
                    </li>
                    <li>
                        dear@letters-unsent.com
                    </li>
                </ul>
                
                {/* <ContactForm /> */}
            </section>

        </div>  
        
    )
}