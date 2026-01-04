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
            <h3 className="about-section-h3">
                Steward's Notes
            </h3>
            <p>
                Small improvements will be noted here as they arrive.
            </p>

            <section>
                <h4 style={{display: "inline-block"}}>v1.0 - opening the cove</h4>
                <p className="changelog-date">Jan 4th 2026</p>
                <ul>
                    <li>
                        No accounts, no tracking, and no data collection beyond the letter a writer chooses to share. 
                    </li><li>
                        Visitors can browse and read letters quietly, without metrics.
                    </li><li>
                        Long letters are shortened on the landing page, and presented in full when selected.
                    </li><li>
                        Writers can submit a letter through a guided writing experience with Cove - this space&apos;s quiet AI presence.
                    </li><li>
                        Letters follow a simple structure: the letter itself, an optional intended recipient, an optional sign-off, and a submission date.
                    </li><li>
                        Letters submitted to the public archive are moderated by Cove for safety
                        in-line with <Link href="/about">guidelines stated here</Link>.
                    </li><li>
                        This website can be navigated using keyboard-only controls, with screen reader support and mobile-friendly layouts.
                    </li><li>
                        Basic errors from third-party services are surfaced clearly to the visitor or writer.
                    </li><li>
                        Clear channels are provided for contact and support where available 
                        (choice between anonymous contact via third party provider, and direct to personal email address).
                    </li>
                </ul>
                <p>
                    This marks the opening state of the space - small, intentional, and held with care.
                </p>
            </section>

        </article>
    )
}