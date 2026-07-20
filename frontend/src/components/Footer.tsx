"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function Footer() {
  return (
    <footer className="footer">
      <motion.div
        className="wrap footer-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/assets/logo.png"
              alt="Lead Hippo"
              width={190}
              height={86}
              className="footer-logo"
            />
          </motion.div>

          <p>
            Verified homeowner renovation opportunities for Canadian
            contractors. Maximum three contractors per opportunity.
          </p>

          <div className="footer-badges">
            <motion.div
              whileHover={{ y: -4, scale: 1.06 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/assets/badge-canadian.png"
                alt="Canadian marketplace"
                width={50}
                height={50}
              />
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.06 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/assets/badge-shield.png"
                alt="Secure marketplace"
                width={50}
                height={50}
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3>Marketplace</h3>

          <motion.div whileHover={{ x: 5 }}>
            <Link href="/opportunities" style={{ textDecoration: "none" }}>Opportunities</Link>
          </motion.div>

          <motion.div whileHover={{ x: 5 }}>
            <Link href="/#how-it-works" style={{ textDecoration: "none" }}>How It Works</Link>
          </motion.div>

          <motion.div whileHover={{ x: 5 }}>
            <Link href="/faq" style={{ textDecoration: "none" }}>FAQ</Link>
          </motion.div>

          <motion.div whileHover={{ x: 5 }}>
            <Link href="/cart" style={{ textDecoration: "none" }}>Cart</Link>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3>Support</h3>

          <motion.div whileHover={{ x: 5 }}>
            <Link href="/contact" style={{ textDecoration: "none" }}>Contact Us</Link>
          </motion.div>

          <motion.div whileHover={{ x: 5 }}>
            <Link href="/refund-claim" style={{ textDecoration: "none" }}>Submit a Claim</Link>
          </motion.div>

          <motion.div whileHover={{ x: 5 }}>
            <a
              href={`mailto:${
                process.env.NEXT_PUBLIC_CONTACT_EMAIL || "leads@leadhippo.ca"
              }`}
              style={{ textDecoration: "none" }}
            >
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "leads@leadhippo.ca"}
            </a>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3>Legal</h3>

          <motion.div whileHover={{ x: 5 }}>
            <Link href="/terms" style={{ textDecoration: "none" }}>Terms of Service</Link>
          </motion.div>

          <motion.div whileHover={{ x: 5 }}>
            <Link href="/privacy" style={{ textDecoration: "none" }}>Privacy Policy</Link>
          </motion.div>

          <motion.div whileHover={{ x: 5 }}>
            <Link href="/refunds" style={{ textDecoration: "none" }}>Refund Policy</Link>
          </motion.div>

          <motion.div whileHover={{ x: 5 }}>
            <Link href="/disclaimers" style={{ textDecoration: "none" }}>Legal Disclaimers</Link>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="wrap footer-bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        <span>
          © {new Date().getFullYear()} Lead Hippo. All rights reserved.
        </span>
      </motion.div>
    </footer>
  );
}