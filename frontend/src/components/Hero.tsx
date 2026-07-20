import Link from "next/link";
export function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-content">
        <h1>
          More Leads.
          <br />
          More Jobs.
          <br />
          <em>More Growth.</em>
        </h1>
        <p>
          Lead Hippo connects contractors with verified homeowner project
          opportunities across Ontario. Browse fresh opportunities, purchase
          access instantly, and contact homeowners directly.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/opportunities">
            Browse Opportunities
          </Link>
          <Link className="button button-white" href="/#how-it-works">
            How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}
