import Link from "next/link";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { LeadGrid } from "@/components/LeadGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { getLeads } from "@/lib/api";
import { AnimatedReveal } from "@/components/AnimatedReveal";
export const dynamic = "force-dynamic";
export const revalidate = 30;
export default async function Home() {
  const leads = await getLeads();

  const featured = leads.filter(
    (lead) => lead.isFeatured === true
  );

  return (
    <>
      <Hero />
      <TrustStrip />
      <AnimatedReveal>
        <section className="section">
          <div className="wrap">
            <div className="section-heading split">
              <div>
                <span className="eyebrow">VERIFIED & READY FOR QUOTES</span>
                <h2>Featured Opportunities</h2>
              </div>

              <Link href="/opportunities" className="view-all-link">
                View all opportunities →
              </Link>
            </div>

            <LeadGrid leads={featured} />
          </div>
        </section>
      </AnimatedReveal>

      <AnimatedReveal className="scarcity">
        <div className="wrap">
          <strong>New opportunities added daily</strong>
          <span>•</span>
          Only <strong>3 contractors</strong> per opportunity
          <span>•</span>
          <strong>First come, first served</strong>
        </div>
      </AnimatedReveal>

      <AnimatedReveal>
        <HowItWorks />
      </AnimatedReveal>
      <AnimatedReveal>
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

            {/* <Link className="button button-white" href="/opportunities">
              Browse Opportunities
            </Link> */}
            <Link
              className="button button-white inline-block transition-all !hover:bg-white duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] active:scale-95"
              href="/opportunities"
            >
              Browse Opportunities
            </Link>
          </div>
        </section>
      </AnimatedReveal>
    </>
  );
}
