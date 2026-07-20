// import Image from "next/image";
// const items = [
//   [
//     "/assets/trust-verified.svg",
//     "Verified Homeowners",
//     "We speak to every homeowner",
//   ],
//   ["/assets/trust-consent.svg", "Consent to Share", "Homeowner approved"],
//   ["/assets/trust-projects.svg", "Real Projects", "Not scraped. Not bots."],
//   [
//     "/assets/trust-quality.svg",
//     "Quality Over Quantity",
//     "3 contractors per opportunity",
//   ],
// ];
// export function TrustStrip() {
//   return (
//     <section className="trust-strip">
//       <div className="wrap trust-grid">
//         {items.map(([src, title, text]) => (
//           <div className="trust-item" key={title}>
//             <Image src={src} alt="" width={54} height={54} />
//             <strong>{title}</strong>
//             <span>{text}</span>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const items = [
  [
    "/assets/trust-verified.svg",
    "Verified Homeowners",
    "We speak to every homeowner",
  ],
  ["/assets/trust-consent.svg", "Consent to Share", "Homeowner approved"],
  ["/assets/trust-projects.svg", "Real Projects", "Not scraped. Not bots."],
  [
    "/assets/trust-quality.svg",
    "Quality Over Quantity",
    "3 contractors per opportunity",
  ],
];

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
    y: 25,
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

export function TrustStrip() {
  return (
    <section className="trust-strip">
      <motion.div
        className="wrap trust-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {items.map(([src, title, text]) => (
          <motion.div
            className="trust-item"
            key={title}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.25 }}
          >
            <Image src={src} alt="" width={54} height={54} />
            <strong>{title}</strong>
            <span>{text}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}