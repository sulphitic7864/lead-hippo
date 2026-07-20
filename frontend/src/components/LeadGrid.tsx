import type { PublicLead } from "@/types";
import { LeadCard } from "./LeadCard";
export function LeadGrid({
  leads,
  empty = "No opportunities are currently available. Please check back soon.",
}: {
  leads: PublicLead[];
  empty?: string;
}) {
  return leads.length ? (
    <div className="lead-grid">
      {leads.map((l) => (
        <LeadCard lead={l} key={l.leadCode} />
      ))}
    </div>
  ) : (
    <div className="empty-state">
      <h3>Fresh opportunities are coming</h3>
      <p>{empty}</p>
    </div>
  );
}
