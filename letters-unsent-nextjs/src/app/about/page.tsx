import Link from "next/link"

export default function About() {
    return (
        <div>
            <h1>
                About Letters Unsent
            </h1>
            <p>
                The inspiration for this app has been heavily inspired by Esther Perel. <Link href="https://www.estherperel.com/blog/ull-introduction">Her perspective</Link> made me more aware of the emancipating power of writing a letter—the release and clarity that writing can bring, even when the letter remains unsent. It’s this experience that I wanted to amplify and honour through a dedicated web app.
            </p><p>
                While there is a website called <Link href="https://theunsentproject.com/#">The Unsent Project</Link>, it focuses on texts never sent, specifically in a romantic context. I wanted to explore a broader spectrum. The richness of human experience encompasses a variety of relationships—our great loves aren’t limited to romance but extend to friendships, family, and even neighbours. *Letters Unsent* aims to capture that diversity.
            </p>
            <p>
                There are also multiple other platforms to submit unsent letters like reddit, and these other places. I wanted to create one that is closer to my vision and through a dedicated app.
            </p><p>
                I hope people find comfort in sharing or reading these unsent letters in knowing that others, too, have words left unspoken.
            </p>

            {/* -------------------------------------------------------- */}

            <h2>
                Submission Guidelines
            </h2>
            <p>
                All letters of any content and tones are welcome on this website. However, you cannot:
            </p>
            <ul>
                <li>publicly share someone else's personal details like address, phone number, email etc
                </li><li>submit violent content
                </li>
            </ul>

            {/* -------------------------------------------------------- */}

            <h2>
                Roadmap & Features
            </h2>
            <p>
                This public release version is MVP. If you want to see what else I have planned including what I'm building right now, please see my <Link href="https://chrispycrust.notion.site/Letters-Unsent-Solo-Scrum-Board-d5e248a545a7494ba36961b0daec45cc">solo scrum board</Link>.
            </p>
            <p>
                If you have any suggestions, comments or feedback please see how to contact me below.
            </p>

            {/* -------------------------------------------------------- */}

            <h2>
                Who I am & Contact
            </h2>
            <p>
                I'm a writer of several letters myself (some of them are on this platform). You can have a dig around what I'm thinking on my personal website <Link href="https://www.bychristine.au/">here</Link>.
            </p>
            <p>
                Feel free to reach me at email@protonmail.com
            </p>

        </div>  
    )
}