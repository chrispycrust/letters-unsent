import Link from "next/link"

export default function Changelog() {
    return (
        <article 
            id="changelog"
            className="about-section"
        >

            <h1 className="about-section-h1">
                Changelog
            </h1>
            <p>
                Improvements will be noted here as they arrive.
            </p>

            <section>
                <h4 style={{display: "inline-block"}}>v1.0 - opening the cove to visitors</h4>
                <p className="changelog-date">Jan 5th 2026</p>
                <ul>
                    <li>
                        No accounts, no tracking, and no data collection beyond the letter a writer chooses to share. 
                    </li><li>
                        Visitors can browse and read letters quietly, without metrics.
                    </li><li>
                        Long letters are shortened on the landing page, and presented in full when selected.
                    </li><li>
                        Letters follow a simple structure: the letter itself, an optional intended recipient, an optional sign-off, and a submission date.
                    </li><li>
                        Writers can experience a guided writing experience with Cove - this space&apos;s quiet AI presence - 
                        though letters cannot yet be submitted (the submission process is under refinement).
                    </li><li>
                        Guided writing conversations are moderated by Cove for safety in line with <Link href="/about">guidelines stated here</Link>.
                    </li><li>
                        This website can be navigated using keyboard-only controls, with screen reader support and is mobile-friendly.
                    </li><li>
                        Basic errors from third-party services are surfaced to visitors and writers.
                    </li><li>
                        Clear channels created for contact and support, 
                        including anonymous contact via a third-party provider and direct email.
                    </li>
                </ul>
                <p>
                    This marks the initial opening of the space - small, intentional, and held with care.
                </p>
            </section>

        </article>
    )
}