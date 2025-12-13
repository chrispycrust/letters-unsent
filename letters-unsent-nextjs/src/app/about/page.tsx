import Link from "next/link"

export default function About() {
    return (
        <div className="about-section">
            <h1>
                About Letters Unsent
            </h1>
            <p>
                This platform is a labour of love. The inspiration for it was sparked by Esther Perel whose <Link href="https://www.estherperel.com/blog/ull-introduction">perspective </Link> 
                made me more aware of the emancipating power of writing a letter—the release and clarity that writing can bring, even when the letter remains unsent. 
            </p><p>
                There are already multiple other places where you can go to release unsent things: 
            </p>

            <ul>
                <li>
                    <Link href="/">this reddit thread</Link>
                </li><li>
                    <Link href="/">these</Link>
                </li><li>
                    <Link href="/">other</Link>
                </li><li>
                    <Link href="/">places</Link>
                </li><li>
                    <Link href="https://theunsentproject.com/#">The Unsent Project</Link>
                </li><li>
                    <Link href="/">multiple other instagram accounts</Link>
                </li>
            </ul>

            <p>
                But I wanted to amplify and honour such personal experiences through a dedicated home built according to my own vision while also learning hands-on experience with full stack (leaning towards front end) development. The Unsent Project also focuses on only texts never sent, specifically in a romantic context. 
                I wanted to capture a diversity of human experiences—our great loves aren’t limited to romance but extend to friendships, family, neighbours, even complete strangers. 
            </p><p>
                There’s also something uniquely powerful about letters; their inherent introspection, the way they demand our full attention make them stand apart in a world dominated by fleeting tweets, short texts, and split-second engagements. 
                In a time where brevity often wins, longer-form content like letters requires more effort—but it can also offer more reward.
            </p><p>
                I hope people find comfort in reading these letters or sharing their own, knowing that others, too, have words left unspoken.
            </p>

            {/* -------------------------------------------------------- */}

            <h2>
                Privacy & Safety
            </h2>
            <p>
                Anonymity and consent is highly important. None of your details are stored on this website other than what you choose to share. Nothing is tracked.
            </p>
            <p>
                Please don't share anything on this website if you think you might want to edit or delete it later. 
                I can't delete anything that you can't prove is yours. 
                Ability to edit and delete anonymously will be worked on in the next iteration. (See "Roadmap & Features" section below.)
            </p>

            {/* -------------------------------------------------------- */}

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
                Please reach out to me personally if you come across these situations:
            </p>
            <ul>
                <li>
                    If you're convinced your letter doesn't violate any of the above guidelines but still have issues submitting.
                </li><li>
                    If you read a letter and thinks it should not be displayed publicly
                </li><li>
                    If you're convinced any of the disallowed content above should be reconsidered
                </li>
            </ul>

            {/* -------------------------------------------------------- */}

            <h2>
                Roadmap & Features
            </h2>
            <p>
                I'm currently expanding the ability to <strong>update</strong> and <strong>delete</strong> submitted letters anonymously in v1.1.
            </p><p>
                If you want to see what I've planned for the patform, please see my <Link href="https://chrispycrust.notion.site/Letters-Unsent-Solo-Scrum-Board-d5e248a545a7494ba36961b0daec45cc">solo sprint board</Link>.
            </p><p>
                Suggestions, comments or feedback for this platform are welcome—please reach out to me via the contact below.
            </p>

            {/* -------------------------------------------------------- */}

            <h2>
                Creator & Contact
            </h2>
            <p>
                Engineer (code) but still an artist at heart, and writer of several letters myself. You can find out more about me on my personal website <Link href="https://www.bychristine.au/">here</Link>.
            </p>
            <p>
                Feel free to reach me via <strong>letters-unsent@protonmail.com</strong>, or any of my social media outlets.
            </p>

        </div>  
    )
}