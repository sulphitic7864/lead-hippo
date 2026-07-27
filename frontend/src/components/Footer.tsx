"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCcVisa, FaCcMastercard, FaCcStripe } from "react-icons/fa";

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
        {/* BRAND */}
        <motion.div variants={itemVariants}>
          <Image
            src="/assets/logo_new.png"
            alt="Lead Hippo"
            width={190}
            height={86}
            className="footer-logo"
          />

          <p>
            Verified homeowner renovation opportunities for Canadian
            contractors. Maximum three contractors per opportunity.
          </p>

          <div className="footer-badges">
            <Image
              src="/assets/badge-shield.png"
              alt=""
              width={45}
              height={45}
            />

            <Image src="/assets/icon-lock.png" alt="" width={45} height={45} />

            <Image
              src="/assets/icon-verified.png"
              alt=""
              width={45}
              height={45}
            />
          </div>
        </motion.div>

        {/* QUICK LINKS */}

        <motion.div variants={itemVariants}>
          <h3>QUICK LINKS</h3>

          <Link href="/opportunities">Opportunities</Link>

          <Link href="/how-it-works">How It Works</Link>

          <Link href="/faq">FAQ</Link>

          <Link href="/contact">Contact</Link>
        </motion.div>

        {/* LEGAL */}

        <motion.div variants={itemVariants}>
          <h3>LEGAL</h3>

          <Link href="/terms">Terms of Service</Link>

          <Link href="/privacy">Privacy Policy</Link>

          <Link href="/refunds">Refund Policy</Link>
        </motion.div>

        {/* PAYMENTS */}

        <motion.div variants={itemVariants} className="secure-payment">
          <h3>SECURE PAYMENTS</h3>

          <div className="payment-icons">
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="payment-box stripe"
              aria-label="Stripe Payments"
            >
              <FaCcStripe size={45} />
            </a>

            <a
              href="https://www.visa.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="payment-box"
              aria-label="Visa Payments"
            >
              <FaCcVisa size={45} />
            </a>

            <a
              href="https://www.mastercard.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="payment-box"
              aria-label="Mastercard Payments"
            >
              <FaCcMastercard size={45} />
            </a>
          </div>

          <p>Official Stripe & card marks</p>
        </motion.div>
      </motion.div>

      <motion.div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} Lead Hippo. All rights reserved.
        </span>

        <div className="canadian">
          <Image
            src="/assets/flag-of-canada.jpeg"
            alt="Canada"
            width={75}
            height={45}
          />

          <div>
            <strong>Proudly Canadian</strong>
            <span>Supporting local businesses</span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
