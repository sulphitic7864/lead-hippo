"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { PublicLead } from "@/types";
import { formatMoney, formatDate } from "@/lib/api";

export function LeadCard({ lead }: { lead: PublicLead }) {
  const sold = lead.status === "SOLD_OUT" || lead.spotsRemaining === 0;
  const photo = lead.photos.find((p) => p.isPrimary) || lead.photos[0];

  function getListingAge(publishedAt: string | null) {
    if (!publishedAt) {
      return 0;
    }

    const publishedDate = new Date(publishedAt);
    const now = new Date();

    const hours = Math.floor(
      (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60),
    );

    return hours;
  }
  const hoursAgo = getListingAge(lead.publishedAt);

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

        {lead.trade && !sold && (
          <motion.span
            className="new-badge"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {lead.trade?.name ?? "Other"}
          </motion.span>
        )}
        {/* {lead.isNew && !sold && (
          <motion.span
            className="new-badge"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            NEW
          </motion.span>
        )} */}
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
            Within {lead.timeline} Days
          </span>
        </div>
        <div className="lead-checks">
          {hoursAgo <= 48 && (
            <div>
              <span>✓</span>
              Contacted within ({hoursAgo} hours ago)
            </div>
          )}

          <div>
            <span>✓</span>
            Budget Confirmed
          </div>

          <div>
            <span>✓</span>
            Photos Available
          </div>
        </div>
        <p>{lead.description}</p>

        <div className="posted">Posted {formatDate(lead.publishedAt)}</div>
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
          <button disabled className="oppertunity-btn">
            Sold Out
          </button>
        ) : (
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="oppertunity-btn"
          >
            <Link
              href={`/opportunities/${lead.leadCode}`}
              style={{ textDecoration: "none" }}
            >
              View Details
            </Link>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}
