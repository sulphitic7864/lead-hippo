"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const steps = [
  [
    "/assets/icon-1-browse.png",
    "Browse Opportunities",
    "View verified homeowner projects in your area",
  ],
  [
    "/assets/icon-2-purchase.png",
    "Purchase Access",
    "Buy the opportunity and secure your spot",
  ],
  [
    "/assets/icon-3-details.png",
    "Get the Details",
    "Receive contact information and project details",
  ],
  [
    "/assets/icon-4-contact.png",
    "Contact & Quote",
    "Reach the homeowner and grow your business",
  ],
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section how">
      <div className="wrap">
        <motion.div
          className="section-heading centered"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span>THE SIMPLE PROCESS</span>
          <h2>How Lead Hippo Works</h2>
        </motion.div>

        <motion.div
          className="steps"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {steps.map(([src, title, text], i) => (
            <motion.div
              className="step"
              key={title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.55,
                    ease: "easeOut",
                  },
                },
              }}
              whileHover={{ y: -6 }}
            >
              <b>{i + 1}</b>

              <motion.div
                style={{ display: "flex", justifyContent: "center" }}
                whileHover={{ scale: 1.08, rotate: 3 }}
                transition={{ duration: 0.25 }}
              >
                <Image src={src} alt="" width={100} height={100} />
              </motion.div>

              <h3>{title}</h3>
              <p>{text}</p>

              {i < steps.length - 1 && (
                <motion.span
                  className="step-arrow"
                  animate={{ x: [0, 6, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  →
                </motion.span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
