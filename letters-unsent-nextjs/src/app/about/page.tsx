"use client"

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import Link from "next/link"
import { useState } from "react"
import ArrowBadgeRight from "../../../public/icons/ArrowBadgeRight"
import ArrowBadgeDown from "../../../public/icons/ArrowBadgeDown"
import Toggle from "@/components/Toggle"

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Defines layout across all pages of website

------------------------------------------------------------------------------------------------- 
*/


export default function About() {

    const [ toggleBackground, setToggleBackground ] = useState(false)
    const [ toggleGuidelines, setToggleGuidelines ] = useState(false)
    const [ togglePrivacy, setTogglePrivacy ] = useState(false)
    const [ toggleRoadmap, setToggleRoadmap ] = useState(false)
    const [ toggleContact, setToggleContact ] = useState(false)

    return (
        <article className="about-section">
            
                <h1 
                    className="about-section-h1"
                    id="about"
                >
                    About Letters Unsent
                </h1>
                <h3 className="about-section-h3">
                    A home for words never received
                </h3>

            {/* -------------------------------------------------------- */}

            <section 
                id="background"
            >
                <Toggle 
                    toggleState={toggleBackground}
                    onToggle={() => setToggleBackground(!toggleBackground)}
                    heading="Background"
                    title="Click to toggle ontent related to the background of this space"
                />
                <div className={`toggle-panel ${toggleBackground ? "is-open" : ""}`}>
                    <div className="toggle-panel-inner">
                        <div className="toggle-section">
                            <p>
                                Esther Perel once wrote about <Link href="https://www.estherperel.com/blog/ull-introduction">the emancipating power of letter writing</Link> - 
                                the release and clarity that writing can bring, even when the letter remains unsent. 
                                There is something uniquely powerful about the emotional charge of words that never found their way to a recipient.
                                
                            </p><p>
                                It&apos;s not surprising, then, that many people have created spaces for these words:
                            </p>

                            <ul>
                                <li>
                                    <Link href="https://www.reddit.com/r/UnsentLetters/">r/UnsentLetters</Link>
                                </li><li>
                                    <Link href="https://theunsentproject.com/#">The Unsent Project</Link>
                                </li><li>
                                    instagram accounts like <Link href="https://www.instagram.com/unsent_letters_to/">unsent_letters_to</Link>
                                </li><li>
                                    <Link href="https://www.unsentlettermailbox.com/">The Unsent Letter Mailbox (NYC)</Link>
                                </li>
                            </ul>
                            <p>
                                So why make this new platform?
                            </p>
                            <ul>
                                <li>
                                    For my first user-driven full-stack application, I wanted to build something meaningful.
                                    To me, that is holding the emotional experiences and lives of others.
                                </li><li>
                                    I wanted to create a space that felt designed with the care I&apos;d want to see in the world.
                                </li><li>
                                    While I admire <Link href="https://theunsentproject.com/#">The Unsent Project</Link>,
                                    the website focuses on unsent texts and in a romantic context. 
                                    I wanted to honour a wider range of human experience - love in all its forms, as well as grief, gratitude, anger, regret, bitterness (to name a few).
                                </li>
                            </ul>
                            <p>
                                In a time where brevity often wins, writing and reading letters require more effort - but it&apos;s also likely to offer more reward.
                            </p>
                            <p>
                                I hope people find comfort in reading these letters or sharing their own, knowing that others, too, have words left unspoken.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------------- */}

            <section
                id="submission-guidelines"
            >   
                <Toggle 
                    toggleState={toggleGuidelines}
                    onToggle={() => setToggleGuidelines(!toggleGuidelines)}
                    heading="Submission Guidelines"
                    title="Click to toggle content related to Submission Guidelines"
                />
                <div className={`toggle-panel ${toggleGuidelines ? "is-open" : ""}`}>
                    <div className="toggle-panel-inner">
                        <div 
                                className="toggle-section"
                                onClick={() => setToggleGuidelines(!toggleGuidelines)}
                                title="Click anywhere to toggle section related to Guidelines"
                            >
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
                                    You&apos;re welcome to reach out if you come across these situations (refer to <Link href="#contact">&quot;Contact&quot; section</Link>):
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
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------------- */}

            <section
                id="privacy-and-use"
            >
                <Toggle 
                    toggleState={togglePrivacy}
                    onToggle={() => setTogglePrivacy(!togglePrivacy)}
                    heading="Privacy & Use"
                    title="Click to toggle ontent related to Privacy & Use"
                />
                <div className={`toggle-panel ${togglePrivacy ? "is-open" : ""}`}>
                    <div className="toggle-panel-inner">
                        <div className="toggle-section">
                            <p>
                                Letters Unsent is a living project, designed as a quiet, anonymous space.
                                Care, transparency, and restraint guides how it grows.
                            </p>

                            <section>
                                <h3>
                                    Anonymity
                                </h3>
                                <ul>
                                    <li>
                                        No accounts are required to submit a letter.
                                    </li>
                                    <li>
                                        No names, emails, or identifying information are collected.
                                    </li>
                                    <li>
                                        Submissions are not linked to individuals.
                                    </li>
                                </ul>
                                <p
                                    id="note-about-update-and-delete"
                                >
                                    <strong>Note:</strong> This means that, at this stage, without proof of ownership I'm unable to delete or edit letters on request. 
                                    I&apos;m working on an anonymous edit/delete feature for the next update 
                                    (see <Link href="#anon-update-and-delete">&quot;Roadmap & Features&quot; section</Link> just below.) 
                                    Until then, please only share what you&apos;re comfortable leaving in public permanently.
                                </p>
                            </section>
                            <section>
                                <h3 
                                    id="ai-assisted-writing"
                                >
                                    AI-assisted writing
                                </h3>
                                <p>
                                    To submit a letter, you must go through <Link href="submit">Release A Letter</Link> and talk to Cove (what I call the AI presence).
                                    This is linked to a third party provider, <Link href="https://platform.openai.com/docs/overview">OpenAI</Link>. 
                                </p>
                                <p>
                                    These conversations are: 
                                </p>
                                <ul>
                                    <li>
                                        processed server-side on this web app and called from OpenAI's servers to generate responses
                                    </li>
                                    <li>
                                        not saved to a database
                                    </li>
                                    <li>
                                        not used for training OpenAI's models
                                    </li>
                                    <li>
                                        not stored, reviewed, or retained (unless absolutely required and with consent)
                                    </li>
                                </ul>
                                <p>
                                    However, the provider will log request and response data for operational purposes (such as reliability, abuse prevention, and billing). 
                                    This logging is outside my control.
                                </p>
                                <p>
                                    A non-AI submission option will be added in the future for those who prefer it (<Link href="#non-ai-assisted-option">see &quot;Roadmap & Features&quot; section below</Link>).
                                </p>
                            </section>
                            <section>
                                <h3>
                                    What is stored
                                </h3>
                                <p>
                                    Only the final letter you choose to submit is stored in an external database <Link href="https://supabase.com/">Supabase</Link>).
                                    AI prompts, and intermediate conversations are not saved (but they are logged - see above section <Link href="#ai-assisted-writing">&quot;AI assisted writing&quot;</Link>).
                                </p>
                                <p>
                                    If you change your mind and want to edit or remove a submitted letter, it won't be possible at this stage. 
                                    (Please see <Link href="#note-about-update-and-delete">this note in &quot;Anonymity&quot; section</Link>)
                                </p>
                            </section>
                            <section>
                                <h3>
                                    Moderation & Safety 
                                </h3>
                                <p>
                                    Letters are automatically moderated against the <Link href="#submission-guidelines">Submission Guidelines</Link> in
                                    your conversation with Cove (the AI presence) to prevent abuse or harm.
                                    Content that violates those named safety boundaries will not be published.
                                </p>
                            </section>
                            <section>
                                <h3>
                                    Your choice
                                </h3>
                                <p>
                                    Sharing here is always optional.
                                    If something doesn’t feel right, you’re free to leave without submitting anything.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------------------------------- */}

            <section
                id="roadmap-and-features"
            >
                <Toggle 
                    toggleState={toggleRoadmap}
                    onToggle={() => setToggleRoadmap(!toggleRoadmap)}
                    heading="Roadmap & Features"
                    title="Click to toggle content related to Roadmap and Features"
                />

                <div className={`toggle-panel ${toggleRoadmap ? "is-open" : ""}`}>
                    <div className="toggle-panel-inner">
                        <div className="toggle-section">
                            <p>
                                Letters Unsent is more than an archive - it&apos;s a quiet digital cove that I&apos;m tending over time. 
                                (You can view <Link href="/changelog">the changelog here</Link>.)
                            </p>
                            <p>
                                Here&apos;s a little of what I&apos;ve planned so far:
                            </p>
                            <p>
                                <strong>Core functionality:</strong>
                            </p>
                            <ul>
                                <li 
                                    id="non-ai-assisted-option"
                                >
                                    non AI-assisted submission option
                                </li><li 
                                    id="anon-update-and-delete"
                                >
                                    anonymous <strong>update</strong> and <strong>delete</strong> of submitted letters
                                </li><li>
                                    filters, sort and search on submitted letters (based on time, themes, emotion or relationship type for example)
                                </li>
                            </ul>
                            <p>
                                <strong>Experience & atmosphere:</strong>
                            </p>
                            <ul>
                                <li>
                                    emotional memory for Cove (the AI presence) to personalise your experience without storing your data
                                </li><li>
                                    personal letter draft drawer (without storing your data)
                                </li><li>
                                    a sense of community without all the usual noise
                                </li>
                            </ul>
                            <p>
                                I ultimately aim to move beyond functionality without sacrificing usability - for this place to feel simple, yet quietly alive.
                            </p><p>
                                <strong>A gentle note:</strong> I&apos;m building this alone, alongside a full-time job, 
                                other creative non-technical pursuits, and personal life in general. 
                                Some things may arrive slowly, some may evolve along the way. 
                                What won&apos;t change is the commitment to keeping this a respectful, tender space that honours the emotional world of its visitors.
                            </p>
                            <p>
                                Suggestions, comments or feedback for this platform 
                                (for example, what the build priorities should be, features, guideline considerations) are welcome 
                                - please reach out ia the <strong>contact options</strong> in the section just below.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* -------------------------------------------------------- */}

            <section
                id="contact"
            >
                <Toggle 
                    toggleState={toggleContact}
                    onToggle={() => setToggleContact(!toggleContact)}
                    heading="Contact"
                    title="Click to toggle content related to Contact"
                />

                <div className={`toggle-panel ${toggleContact ? "is-open" : ""}`}>
                    <div className="toggle-panel-inner">
                        <div className="toggle-section">
                            <p>I&apos;m a developer by profession, an artist at heart and a writer of a few letters myself.</p>
                            <p>
                                You&apos;re welcome to get in touch about anything related to this website here in these ways: 
                            </p>
                            <ul>
                                <li>
                                    <strong>anonymous contact form: </strong> <Link href="https://tally.so/r/gDdeBD">via Tally forms</Link>
                                </li>
                                <li>
                                    <strong>email: </strong> dear@letters-unsent.com
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </section>

        </article>  
    )
}