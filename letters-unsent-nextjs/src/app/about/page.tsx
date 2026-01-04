"use client"

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import Link from "next/link"
import { useState } from "react"
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

    // function openThenScrollTo(
    //     targetId: string,
    //     open: () => void
    // ) {
    //     open()

    //     requestAnimationFrame(() =>
    //         requestAnimationFrame(() => {
    //         document
    //             .getElementById(targetId)
    //             ?.scrollIntoView({ behavior: "smooth", block: "center" })
    //         })
    //     )
    // }

    // function handleContactLink(
    //     e: React.MouseEvent<HTMLAnchorElement>
    // ) {
    //     e.preventDefault()

    //     setToggleContact(true)
    //     setToggleGuidelines(true)

    //     openThenScrollTo("contact", () => {
    //         setToggleGuidelines(true)
    //         setToggleContact(true)
    //     })

    // }

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
                    controlsId="background-panel"
                />
                <div 
                    id="background-panel"
                    className={`toggle-panel ${toggleBackground ? "is-open" : ""}`}
                    hidden={!toggleBackground}
                >
                    <div className="toggle-panel-inner">
                        <div className="toggle-section">
                            <p>
                                Esther Perel once wrote about <Link 
                                    href="https://www.estherperel.com/blog/ull-introduction"
                                >the emancipating power of a letter</Link> - 
                                the release and clarity that the act of writing itself can bring, even when never sent. 
                            </p><p>
                                Many spaces have been created for these words:
                            </p>

                            <ul>
                                <li>
                                    <Link 
                                        href="https://www.reddit.com/r/UnsentLetters/"
                                    >r/UnsentLetters</Link>
                                </li><li>
                                    <Link 
                                        href="https://theunsentproject.com/#"
                                    >The Unsent Project</Link>
                                </li><li>
                                    instagram accounts like <Link 
                                        href="https://www.instagram.com/unsent_letters_to/"
                                    >unsent_letters_to</Link>
                                </li><li>
                                    <Link 
                                        href="https://www.unsentlettermailbox.com/"
                                    >The Unsent Letter Mailbox (NYC)</Link>
                                </li>
                            </ul>
                            
                            <h3>
                                So why make this new platform?
                            </h3>
                            <p>
                                I&apos;m a developer by profession, an artist at heart and a writer of a few letters myself.
                            </p>
                            <p>
                                For my first user-driven full-stack application, I wanted to build something meaningful -
                                a space that honours a wide range of human experience (not just a particular context): 
                                love in all its forms, grief, gratitude, anger, regret, bitterness.
                            </p>
                            <p>
                                I also simply wanted to create a space that I wish existed in the world -
                                a space that I hope does justice to those experiences.
                            </p>
                            <p>
                                And finally, to me, the letter format somehow seems quietly powerful.
                                There is something especially moving about the emotional charge of words 
                                that have never found their way to their person, for one reason or another.
                                And in a time where it sometimes seems like brevity and performance are the things that are most optimised (understandably). 
                                Writing and reading letters require more effort - but it&apos;s also likely to offer more reward.
                            </p>
                            <p>
                                I hope people find comfort in reading these letters or sharing their own, 
                                knowing that others, too, have words left unspoken.
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
                    controlsId="guidelines-panel"
                />
                <div 
                    id="guidelines-panel"
                    className={`toggle-panel ${toggleGuidelines ? "is-open" : ""}`}
                    hidden={!toggleGuidelines}
                >
                    <div className="toggle-panel-inner">
                        <div 
                            className="toggle-section"
                        >
                            <p>
                                This space welcomes letters of diverse content, tones and subjects. However, this is also a public space.
                                To keep it safe for everyone, please write with compassion (for yourself and others) and avoid the following:
                            </p>
                            <ul>
                                <li>
                                    publicly sharing identifying details that could expose someone&apos;s identity (for example: what appears to be full names, addresses, phone numbers, emails etc)
                                </li><li>
                                    sexually explicit or pornographic content
                                </li><li>
                                    descriptions of non-consensual activity
                                </li><li>
                                    graphic descriptions of violent or traumatic detail
                                </li><li>
                                    vitriolic and abusive speech
                                </li><li>
                                    praise for extremist ideaology
                                </li><li>
                                    suicidal intentions or thoughts detailing instructions or methods of self-harm
                                </li><li>
                                    any of the above involving minors
                                </li>
                            </ul>

                            <p>
                                Submissions containing this content won&apos;t be accepted. 
                            </p><p>
                                You&apos;re welcome <Link 
                                    href="#contact" 
                                    onClick={() => setToggleContact(true)}
                                >to reach out</Link> if you come across these situations:
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
                    controlsId="privacy-panel"
                />
                <div 
                    id="privacy-panel"
                    className={`toggle-panel ${togglePrivacy ? "is-open" : ""}`}
                    hidden={!togglePrivacy}
                >
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
                                    <strong>Note:</strong> This means that, at this stage, without proof of ownership 
                                    I&apos;m unable to delete or edit letters on request. <Link 
                                        href="#anon-update-and-delete" 
                                        onClick={() => setToggleRoadmap(true)} 
                                    >Anonymous edit and delete feature</Link> will be built in the future.
                                    Until then, please only share what you&apos;re comfortable leaving in public permanently.
                                </p>
                            </section>
                            <section>
                                <h3 
                                    id="ai-assisted-writing"
                                >
                                    AI-assisted Writing
                                </h3>
                                <p>
                                    At the moment, letters are submitted through <Link 
                                        href="submit"
                                    >Release A Letter</Link> with the help of Cove (the AI presence).
                                    This experience is enabled by a third-party provider, {" "}<Link 
                                        href="https://platform.openai.com/docs/overview"
                                    >OpenAI</Link>. 
                                </p>
                            </section>
                            <section>
                                <h3>
                                    Moderation & Safety 
                                </h3>
                                <p>
                                    Letters in the final conversational stage with Cove (AI presence on Release page) are checked against the {" "}
                                    <Link 
                                        href="#submission-guidelines" 
                                        onClick={() => setToggleGuidelines(true)}
                                    >Submission Guidelines</Link> to prevent abuse, harm or aggravated distress.
                                    Content that violates those named safety boundaries will not be published.
                                </p>
                            </section>
                            <section>
                                <h3>
                                    What Is Stored
                                </h3>
                                <p>
                                    <strong>TL;DR:</strong> Only the final letter you choose to submit is stored.
                                    AI-assisted conversations are not kept by me. Ability to submit without AI upcoming.
                                </p>
                                <p>
                                    Only the final letter you choose to submit is stored in <Link 
                                        href="https://supabase.com/"
                                    >an external database</Link>.
                                </p>
                                <p>
                                    Conversations that happen during AI-assisted writing are handled differently.
                                </p>
                                <ul>
                                    <li>
                                        They are processed server-side to generate a response.
                                    </li>
                                    <li>
                                        They are not saved and stored to a database owned or controlled by me.
                                    </li>
                                </ul>
                                <h4>Storage within my control via OpenAI</h4>
                                <p>
                                    I use the data controls provided by OpenAI&apos;s <Link
                                    href="https://platform.openai.com/docs/api-reference/responses"
                                    >
                                    Responses API
                                    </Link> to limit how AI interactions are handled. This includes:
                                </p>

                                <ul>
                                    <li>
                                        disabling API call logging for this project, which means I cannot see
                                        conversations that take place during AI-assisted writing (see{" "}
                                        <Link
                                            href="https://platform.openai.com/docs/guides/your-data#zero-data-retention"
                                        >
                                            OpenAI&apos;s data retention documentation
                                        </Link>
                                        )
                                    </li>
                                    <li>
                                        setting the <code>store</code> parameter to <code>false</code> on API calls,
                                        which disables storage for responses where supported (see <Link
                                            href="https://platform.openai.com/docs/guides/migrate-to-responses#additional-differences"
                                        >
                                            Responses API documentation
                                        </Link>
                                        )
                                    </li>
                                    <li>
                                        opting out of sharing inputs, outputs, and evaluation data with OpenAI
                                    </li>
                                </ul>

                                <h4>Storage outside my control via OpenAI</h4>

                                <p>
                                    According to{" "}
                                    <Link
                                    href="https://platform.openai.com/docs/guides/your-data"
                                    >
                                    OpenAI&apos;s API data policy
                                    </Link>
                                    , some data may still be retained temporarily by OpenAI for operational
                                    purposes such as abuse monitoring. I do not control this behaviour, nor do I have access to Modified Abuse Monitoring or
                                    Data Residency controls.
                                </p>

                                <p>
                                    In the next iteration, an alternative option to submit via a standard form will be added 
                                    for those who want to submit without AI involvement (see <Link 
                                        href="#non-ai-assisted-option" 
                                        onClick={() => setToggleRoadmap(true)}
                                    >
                                        &quot;Roadmap & Features&quot;
                                    </Link>). Some moderation may still be applied to maintain safety according to <Link 
                                        href="#submission-guidelines" 
                                        onClick={() => setToggleGuidelines(true)}
                                    >Submission Guidelines</Link>.
                                </p>
                                <p>
                                    If you change your mind and want to edit or remove a submitted letter, this is not possible at this stage. 
                                    (Please see <Link 
                                        href="#note-about-update-and-delete" 
                                    >this note</Link> in the &quot;Anonymity&quot; section.)
                                </p>
                            </section>
                            <section>
                                <h3>
                                    Your Choice
                                </h3>
                                <p>
                                    Sharing here is, of course, always optional.
                                    If something doesn&apos;t feel right, you&apos;re free to leave without submitting anything.
                                    You can also <Link 
                                        href="#contact" 
                                        onClick={() => setToggleContact(true)}
                                    >reach out to discuss anything.</Link>
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
                    controlsId="roadmap-panel"
                />

                <div 
                    id="roadmap-panel"
                    className={`toggle-panel ${toggleRoadmap ? "is-open" : ""}`}
                    hidden={!toggleRoadmap}
                >
                    <div className="toggle-panel-inner">
                        <div className="toggle-section">
                            <p>
                                Letters Unsent is more than an archive - it&apos;s a quiet digital cove that I&apos;m tending over time. 
                                (You can view <Link 
                                    href="/changelog"
                                >the changelog here</Link>.)
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
                                <li>
                                    potentially letters that <i>have</i> been sent can also be included, with labelling
                                </li>
                            </ul>
                            <p>
                                <strong>Experience & atmosphere</strong> (all without storing data):
                            </p>
                            <ul>
                                <li>
                                    personalised experience while on this website
                                </li><li>
                                    personal letter draft drawer
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
                                - please reach out via any of the <strong>contact channels</strong> in the section just below.
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
                    controlsId="contact-panel"
                />

                <div 
                    id="contact-panel"
                    className={`toggle-panel ${toggleContact ? "is-open" : ""}`}
                    hidden={!toggleContact}
                >
                    <div className="toggle-panel-inner">
                        <div className="toggle-section">
                            <p>
                                If you'd like, please get in touch about anything related to this website here in these ways: 
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