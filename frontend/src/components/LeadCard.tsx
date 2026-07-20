import Image from "next/image";
import Link from "next/link";
import type { PublicLead } from "@/types";
import { formatMoney, formatDate } from "@/lib/api";
export function LeadCard({ lead }: { lead: PublicLead }) {
  const sold = lead.status === "SOLD_OUT" || lead.spotsRemaining === 0;
  const photo = lead.photos.find((p) => p.isPrimary) || lead.photos[0];
  return (
    <article className={sold ? "lead-card sold" : "lead-card"}>
      <div className="lead-image">
        {photo ? (
          <img src={photo.url} alt={`${lead.title} project`} loading="lazy" />
        ) : (
          <div className="image-placeholder">Project photo</div>
        )}
        <span className="score-badge">
          <small>HIPPOSCORE</small>
          {lead.hippoScore}
        </span>
        {lead.isNew && !sold && <span className="new-badge">NEW</span>}
        {sold && <span className="sold-badge">SOLD OUT</span>}
      </div>
      <div className="lead-body">
        <h3>{lead.title}</h3>
        <div className="lead-location">
          <Image src="/assets/location.png" alt="" width={16} height={16} />
          {lead.city}, {lead.region}
        </div>
        <div className="lead-meta">
          <strong>
            {formatMoney(lead.budgetMinCents)} –{" "}
            {formatMoney(lead.budgetMaxCents)}
          </strong>
          <span>
            <Image src="/assets/calendar.png" alt="" width={15} height={15} />
            {lead.timeline}
          </span>
        </div>
        <p>{lead.description}</p>
        <div className="posted">Posted {formatDate(lead.publishedAt)}</div>
      </div>
      <div className="lead-footer">
        <span className="spots">
          <Image src="/assets/spots.png" alt="" width={18} height={18} />
          {sold
            ? "No spots left"
            : `${lead.spotsRemaining} ${lead.spotsRemaining === 1 ? "spot" : "spots"} left`}
        </span>
        <strong>{formatMoney(lead.priceCents)}</strong>
        {sold ? (
          <button disabled>Sold Out</button>
        ) : (
          <Link href={`/opportunities/${lead.leadCode}`}>View Details</Link>
        )}
      </div>
    </article>
  );
}
