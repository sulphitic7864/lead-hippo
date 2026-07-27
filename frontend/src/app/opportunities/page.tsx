import type { Metadata } from "next";
import { OpportunityFilter } from "@/components/OpportunityFilter";
import { getLeads } from "@/lib/api";
import { AnimatedReveal } from "@/components/AnimatedReveal";
export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Browse active and recently sold-out verified homeowner renovation opportunities.",
};
export const dynamic = "force-dynamic";
export const revalidate = 20;
export default async function Opportunities() {
  const leads = await getLeads();
  return (
    <>
      <AnimatedReveal>
        <section className="page-hero">
          <div className="wrap">
            <span>VERIFIED HOMEOWNER PROJECTS</span>
            <h1>Opportunities</h1>
            <p>
              Choose the projects that fit your team. Every homeowner has spoken
              with us and approved contact from up to three contractors.
            </p>
          </div>
        </section>
      </AnimatedReveal>

        <section className="section opportunities-page">
          <div className="wrap">
            <OpportunityFilter leads={leads} />
          </div>
        </section>
    </>
  );
}
