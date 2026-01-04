export default function Changelog() {
    return (
        <article className="about-section">

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
                <h4>v1.0 - opening the cove</h4>
                <p>Jan 4th 2026</p>
                <ul>
                    <li>
                        No accounts, no tracking, no data collection beyond the letter a writer chooses to share. 
                    </li><li>
                        Visitors can browse and read letters quietly, without metrics.
                    </li><li>
                        If a letter is really long, it will be shortened on the landing page, 
                        but presented in full when "picked up" (selected).
                    </li><li>
                        Submit a letter through a guided writing experience (with Cove).
                    </li><li>
                        Letters conform to a specific shape: content, an intended recipient (as chosen to be named), 
                        a sign off name.
                    </li><li>
                        Submissions moderated for safety and care.
                    </li><li>
                        Accessbility audit: for functional keyboard only navigation, screen reader assistance and mobile view (smallest screen tested: iPhone 13 mini).
                    </li><li>
                        Basic error handling
                    </li>
                </ul>
            </section>

        </article>
    )
}