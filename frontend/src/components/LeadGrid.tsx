"use client";

import type { PublicLead } from "@/types";
import { motion } from "framer-motion";
import { LeadCard } from "./LeadCard";

export function LeadGrid({
  leads,
  empty = "No opportunities are currently available. Please check back soon.",
}: {
  leads: PublicLead[];
  empty?: string;
}) {
  return leads.length ? (
    <motion.div
      className="lead-grid"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.12,
          },
        },
      }}
    >
      {leads.map((lead) => (
        <motion.div
          key={lead.leadCode}
          variants={{
            hidden: {
              opacity: 0,
              y: 30,
            },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: "easeOut",
              },
            },
          }}
        >
          <LeadCard lead={lead} />
        </motion.div>
      ))}
    </motion.div>
  ) : (
    <motion.div
      className="empty-state"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.12,
          },
        },
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h3>Fresh opportunities are coming</h3>
      <p>{empty}</p>
    </motion.div>
  );
}
