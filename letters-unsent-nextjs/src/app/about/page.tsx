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
                <h1 className="about-section-h1">
                    About Letters Unsent
                </h1>
                <h3 className="about-section-h3">
                    <i>A home for words never received</i>
                </h3>
                <p>
                    Esther Perel once wrote about <Link href="https://www.estherperel.com/blog/ull-introduction">the emancipating power of letter writing</Link> - 
                    the release and clarity that writing can bring, even when the letter remains unsent. 
                    There is something uniquely powerful about the emotional charge of words that never found their way to a recipient.
                    In a time where brevity often wins, writing and reading letters require more effort - but it&apos;s also likely to offer more reward.
                </p><p>
                    It&apos;s not surprising, then, that many people have created spaces online to hold these unsent words, including:
                </p>

                <ul>
                    <li>
                        <Link href="https://www.reddit.com/r/UnsentLetters/">r/UnsentLetters</Link>
                    </li><li>
                        <Link href="https://theunsentproject.com/#">The Unsent Project</Link>
                    </li><li>
                        instagram accounts like <Link href="https://www.instagram.com/unsent_letters_to/">unsent_letters_to</Link>
                    </li>
                </ul>
                <p>
                    So why make this new platform?
                </p>
                <ul>
                    <li>
                        I wanted to build something meaningful for my first user-driven full-stack application.
                    </li><li>
                        I also wanted to create a space that felt designed with care to hold the emotional worlds of others.
                    </li><li>
                        While I admire <Link href="https://theunsentproject.com/#">The Unsent Project</Link>,
                        the website focuses on unsent texts and in a romantic context. 
                        I wanted to honour a wider range of human experience - love in all its forms, as well as grief, gratitude, anger, regret, and bitterness to name a few.
                    </li>
                </ul>
                <p>
                    I hope people find comfort in reading these letters or sharing their own, knowing that others, too, have words left unspoken.
                </p>
            </section>

            {/* -------------------------------------------------------- */}

            <section>
                <h2>
                    Submission Guidelines
                </h2>
                <p>
                    This space welcomes letters of diverse content, tones and subjects. However, this is also a public space.
                    To keep it safe for everyone, please write with compassion (for yourself and others) and avoid the following:
                </p>
                <ul>
                    <li>
                        publicly sharing identifying details that could expose someone's identity (for example: what appears to be full names, addresses, phone numbers, emails etc)
                    </li><li>
                        sexually explicit or pornographic content
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
                    </li>
                </ul>

                <p>
                    Submissions containing this content won&apos;t be accepted. 
                </p><p>
                    You're welcome to reach out if you come across these situations (refer to &quot;Contact&quot; section below):
                </p>
                <ul>
                    <li>
                        If you&apos;re convinced your letter doesn&apos;t violate any of the above but you still have issues submitting.
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
                    Anonymity and consent are highly important. 
                </p>
                <p>
                    To preserve anonymity, this app doesn't collect personal data beyond what you choose to share in your letter. 
                    Conversations with Cove (the AI presence during submission on the <Link href="submit">Release A Letter</Link> page) are also not stored. 
                </p>
                <p>
                    This means that, at this stage, I'm unable to delete or edit letters on request. 
                </p>
                <p>
                    I&apos;m working on an anonymous edit/delete feature for the next update (see &quot;Roadmap & Features&quot; section just below.) 
                    Until then, please only share what you&apos;re comfortable leaving public permanently.
                </p>
            </section>

            {/* -------------------------------------------------------- */}

            <section>
                <h2>
                    Roadmap & Features
                </h2>
                <p>
                    Letters Unsent is more than an archive - it&apos;s a quiet digital cove that I&apos;m tending over time.
                </p>
                <p>
                    Here&apos;s a little of what I&apos;ve planned so far:
                </p>
                <p>
                    <strong>Core functionality:</strong>
                </p>
                <ul>
                    <li>
                        anonymous <strong>update</strong> and <strong>delete</strong> of submitted letters
                    </li><li>
                        standard form submission option alongside current guided conversation with Cove (AI API)
                    </li><li>
                        filters, sort and search on submitted letters
                    </li>
                </ul>
                <p>
                    <strong>Experience & atmosphere:</strong>
                </p>
                <ul>
                    <li>
                        emotional memory for Cove (the presence behind the AI API) to personalise your experience without your data
                    </li><li>
                        personal letter draft drawer
                    </li><li>
                        a sense of community without all the usual noise
                    </li>
                </ul>
                <p>
                    I ultimately aim to move beyond functionality without sacrificing usability - for this place to feel simple, yet quietly alive.
                </p><p>
                    A gentle note: these are not promises with deadlines. 
                    I&apos;m building this alone, alongside a full-time job, other creative non-technical pursuits, relationships and life in general. 
                    Some features may arrive slowly - some may evolve along the way. 
                    What won&apos;t change is the commitment to keeping this a respectful, tender space that honours the emotional world of its visitors.
                </p>
                <p>
                    Suggestions, comments or feedback for this platform or on what the build priorities should be are welcome 
                    - please reach out to me via the contact options just below.
                </p>
            </section>
            
            {/* -------------------------------------------------------- */}

            <section
                id="contact"
            >
                <h2>
                    Contact
                </h2>
                <p>I&apos;m a developer by profession, an artist at heart and a writer of a few letters myself.</p>
                <p>
                    You&apos;re welcome to get in touch about anything related to this website here - you can use the following ways: 
                </p>
                <ul>
                    <li>
                        <strong>anonymous contact form: </strong> <Link href="https://tally.so/r/gDdeBD">via Tally forms</Link>
                    </li>
                    <li>
                        <strong>email: </strong> dear@letters-unsent.com
                    </li>
                </ul>
                
                {/* <ContactForm /> */}
            </section>

        </div>  
    )
}