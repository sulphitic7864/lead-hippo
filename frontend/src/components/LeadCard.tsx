// import Image from "next/image";
// import Link from "next/link";
// import type { PublicLead } from "@/types";
// import { formatMoney, formatDate } from "@/lib/api";
// export function LeadCard({ lead }: { lead: PublicLead }) {
//   const sold = lead.status === "SOLD_OUT" || lead.spotsRemaining === 0;
//   const photo = lead.photos.find((p) => p.isPrimary) || lead.photos[0];
//   return (
//     <article className={sold ? "lead-card sold" : "lead-card"}>
//       <div className="lead-image">
//         {photo ? (
//           <img src={photo.url} alt={`${lead.title} project`} loading="lazy" />
//         ) : (
//           <div className="image-placeholder">Project photo</div>
//         )}
//         <span className="score-badge">
//           <small>HIPPOSCORE</small>
//           {lead.hippoScore}
//         </span>
//         {lead.isNew && !sold && <span className="new-badge">NEW</span>}
//         {sold && <span className="sold-badge">SOLD OUT</span>}
//       </div>
//       <div className="lead-body">
//         <h3>{lead.title}</h3>
//         <div className="lead-location">
//           <Image src="/assets/location.png" alt="" width={16} height={16} />
//           {lead.city}, {lead.region}
//         </div>
//         <div className="lead-meta">
//           <strong>
//             {formatMoney(lead.budgetMinCents)} –{" "}
//             {formatMoney(lead.budgetMaxCents)}
//           </strong>
//           <span>
//             <Image src="/assets/calendar.png" alt="" width={15} height={15} />
//             {lead.timeline}
//           </span>
//         </div>
//         <p>{lead.description}</p>
//         <div className="posted">Posted {formatDate(lead.publishedAt)}</div>
//       </div>
//       <div className="lead-footer">
//         <span className="spots">
//           <Image src="/assets/spots.png" alt="" width={18} height={18} />
//           {sold
//             ? "No spots left"
//             : `${lead.spotsRemaining} ${lead.spotsRemaining === 1 ? "spot" : "spots"} left`}
//         </span>
//         <strong>{formatMoney(lead.priceCents)}</strong>
//         {sold ? (
//           <button disabled>Sold Out</button>
//         ) : (
//           <Link href={`/opportunities/${lead.leadCode}`}>View Details</Link>
//         )}
//       </div>
//     </article>
//   );
// }
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { PublicLead } from "@/types";
import { formatMoney, formatDate } from "@/lib/api";

export function LeadCard({ lead }: { lead: PublicLead }) {
  const sold = lead.status === "SOLD_OUT" || lead.spotsRemaining === 0;
  const photo = lead.photos.find((p) => p.isPrimary) || lead.photos[0];

  return (
    <motion.article
      className={sold ? "lead-card sold" : "lead-card"}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="lead-image">
        {photo ? (
          <motion.img
            src={photo.url}
            alt={`${lead.title} project`}
            loading="lazy"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="image-placeholder">Project photo</div>
        )}

        <motion.span
          className="score-badge"
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <small>HIPPOSCORE</small>
          {lead.hippoScore}
        </motion.span>

        {lead.isNew && !sold && (
          <motion.span
            className="new-badge"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            NEW
          </motion.span>
        )}

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

        <div className="posted">
          Posted {formatDate(lead.publishedAt)}
        </div>
      </div>

      <div className="lead-footer">
        <span className="spots">
          <Image src="/assets/spots.png" alt="" width={18} height={18} />

          {sold
            ? "No spots left"
            : `${lead.spotsRemaining} ${
                lead.spotsRemaining === 1 ? "spot" : "spots"
              } left`}
        </span>

        <strong>{formatMoney(lead.priceCents)}</strong>

        {sold ? (
          <button disabled className="oppertunity-btn">Sold Out</button>
        ) : (
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
                   className="oppertunity-btn"
          >
            <Link href={`/opportunities/${lead.leadCode}`} style={{ textDecoration: "none" }}>
              View Details
            </Link>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}