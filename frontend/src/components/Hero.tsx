
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export function Hero() {
  return (
    <section className="hero">
      <motion.div
        className="wrap hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants}>
          More Leads.
          <br />
          More Jobs.
          <br />
          <em>More Growth.</em>
        </motion.h1>

        <motion.p variants={itemVariants}>
          Lead Hippo connects contractors with verified homeowner project
          opportunities across Ontario. Browse fresh opportunities, purchase
          access instantly, and contact homeowners directly.
        </motion.p>

        <motion.div className="hero-actions" variants={itemVariants}>
          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link className="button" href="/opportunities">
              Browse Opportunities
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link className="button button-white" href="/#how-it-works">
              How It Works
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}