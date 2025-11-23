import Link from "next/link"

export default function About() {
    return (
        <div>
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
                Submission Guidelines
            </h2>
            <p>
                All letters of any content and tones are welcome on this website. However, you cannot:
            </p>
            <ul>
                <li>
                    publicly share someone else's personal details like address, phone number, email etc
                </li><li>
                    submit letters containing: violent, hateful, threatening, harrassment, illicit, self-harming, sexual material involving minors
                </li>
            </ul>
            <p>Submission of this type of content will be prevented. If you're convinced your letter doesn't violate any of the above guidelines but still have issues submitting, please reach out to me personally via the contact below.</p>

            {/* -------------------------------------------------------- */}

            <h2>
                Roadmap & Features
            </h2>
            <p>
                I'm currently expanding the ability to <strong>update</strong> and <strong>delete</strong> submitted letters anonymously in v2.0.
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
                Engineer (code) but still an artist at heart, and writer of several letters myself. You can get more insight about me on my personal website <Link href="https://www.bychristine.au/">here</Link>.
            </p>
            <p>
                Feel free to reach me via <strong>cngu5872@protonmail.com</strong> @letters-unsent.com, or any of my social media outlets.
            </p>

        </div>  
    )
}