import Link from "next/link";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { LeadGrid } from "@/components/LeadGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { getLeads } from "@/lib/api";
export const dynamic = "force-dynamic";
export const revalidate = 30;
export default async function Home() {
  const featured = (await getLeads(true)).slice(0, 3);
  return (
    <>
      <Hero />
      <TrustStrip />
      <section className="section">
        <div className="wrap">
          <div className="section-heading split">
            <div>
              <span>FRESH & VERIFIED</span>
              <h2>Featured Opportunities</h2>
            </div>
            <Link href="/opportunities">View all opportunities →</Link>
          </div>
          <LeadGrid leads={featured} />
        </div>
      </section>
      <div className="scarcity">
        <div className="wrap">
          <strong>New opportunities added daily</strong>
          <span>•</span>Only <strong>3 contractors</strong> per opportunity
          <span>•</span>
          <strong>First come, first served</strong>
        </div>
      </div>
      <HowItWorks />
      <section className="section final-cta">
        <div className="wrap">
          <div>
            <span>READY TO GROW?</span>
            <h2>Secure your next opportunity today.</h2>
            <p>
              No subscription. Choose only the verified projects that fit your
              business.
            </p>
          </div>
          <Link className="button button-white" href="/opportunities">
            Browse Opportunities
          </Link>
        </div>
      </section>
    </>
  );
}
