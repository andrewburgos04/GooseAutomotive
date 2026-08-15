import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-label="TechSync Systems support">
        <div className="hero__content">
          <p className="hero__brand">
            TechSync
            <span>Systems</span>
          </p>
          <h1>Support that stays in sync with your stack.</h1>
          <p>
            Open a ticket, track progress, and get clear updates from the
            TechSync team — built for the systems you rely on every day.
          </p>
          <div className="cta-row">
            <Link className="btn btn--primary" href="/submit">
              Submit a ticket
            </Link>
            <Link className="btn btn--ghost" href="/track">
              Track an existing ticket
            </Link>
          </div>
        </div>
      </section>

      <div className="page-shell">
        <section className="section">
          <h2>How client support works</h2>
          <p>
            One place to report issues, request changes, and follow the
            conversation without email ping-pong.
          </p>
          <div className="feature-strip" style={{ marginTop: "1.75rem" }}>
            <article>
              <h3>1. Capture the issue</h3>
              <p>
                Tell us the system, impact, and urgency. We generate a
                TechSync ticket ID instantly.
              </p>
            </article>
            <article>
              <h3>2. We triage &amp; assign</h3>
              <p>
                Support engineers pick up by priority and keep the thread
                updated as work moves.
              </p>
            </article>
            <article>
              <h3>3. Track to resolution</h3>
              <p>
                Use your ticket ID and email anytime to see status and public
                updates.
              </p>
            </article>
          </div>
        </section>
      </div>
    </>
  );
}
