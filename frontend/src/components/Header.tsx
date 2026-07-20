// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import { useState } from "react";
// import { useCart } from "./CartProvider";
// export function Header() {
//   const [open, setOpen] = useState(false);
//   const { items } = useCart();
//   return (
//     <header className="site-header">
//       <div className="wrap nav-inner">
//         <Link href="/" className="brand">
//           <Image
//             src="/assets/logo.png"
//             alt="Lead Hippo"
//             width={176}
//             height={80}
//             priority
//           />
//         </Link>
//         <button
//           className="menu-button"
//           aria-label="Toggle menu"
//           aria-expanded={open}
//           onClick={() => setOpen(!open)}
//         >
//           <span />
//           <span />
//           <span />
//         </button>
//         <nav
//           className={open ? "main-nav open" : "main-nav"}
//           onClick={() => setOpen(false)}
//         >
//           <Link href="/#how-it-works">How It Works</Link>
//           <Link href="/opportunities">Opportunities</Link>
//           <Link href="/faq">FAQ</Link>
//           <Link href="/contact">Contact</Link>
//           <Link
//             href="/cart"
//             className="cart-link"
//             aria-label={`Cart with ${items.length} items`}
//           >
//             <span className="bag-icon">▢</span>
//             {items.length > 0 && <b>{items.length}</b>}
//             <span className="cart-word">Cart</span>
//           </Link>
//         </nav>
//       </div>
//     </header>
//   );
// }
"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX, FiShoppingBag } from "react-icons/fi";
import { useState } from "react";
import { useCart } from "./CartProvider";

const navItems = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const headerVariants = {
  hidden: {
    opacity: 0,
    y: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
      staggerChildren: 0.08,
    },
  },
};

const navItemVariants = {
  hidden: {
    opacity: 0,
    y: -12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
};

const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    height: "auto",
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -10,
    transition: {
      duration: 0.25,
      ease: "easeIn" as const,
    },
  },
};

export function Header() {
  const [open, setOpen] = useState(false);
  const { items } = useCart();

  const closeMenu = () => setOpen(false);

  return (
    <motion.header
      className="site-header"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="wrap nav-inner">
        <motion.div
          variants={navItemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href="/" className="brand" onClick={closeMenu}>
            <Image
              src="/assets/logo.png"
              alt="Lead Hippo"
              width={176}
              height={80}
              priority
            />
          </Link>
        </motion.div>

        <motion.button
          type="button"
          className="menu-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen((previous) => !previous)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                className="menu-icon"
                initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                <FiX />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                className="menu-icon"
                initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                <FiMenu />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.nav
          id="main-navigation"
          className="main-nav desktop-nav"
          variants={headerVariants}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <motion.div
              key={item.href}
              variants={navItemVariants}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link href={item.href}>{item.label}</Link>
            </motion.div>
          ))}

          <motion.div
            variants={navItemVariants}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            <Link
              href="/cart"
              className="cart-link"
              aria-label={`Cart with ${items.length} ${
                items.length === 1 ? "item" : "items"
              }`}
            >
              <span className="bag-icon">
                <FiShoppingBag />
              </span>

              <AnimatePresence mode="popLayout">
                {items.length > 0 && (
                  <motion.b
                    key={items.length}
                    className="cart-count"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 22,
                    }}
                  >
                    {items.length}
                  </motion.b>
                )}
              </AnimatePresence>

              <span className="cart-word">Cart</span>
            </Link>
          </motion.div>
        </motion.nav>

        <AnimatePresence>
          {open && (
            <motion.nav
              className="main-nav mobile-nav"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-label="Mobile navigation"
            >
              {navItems.map((item) => (
                <motion.div
                  key={item.href}
                  variants={navItemVariants}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={item.href} onClick={closeMenu}>
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div variants={navItemVariants}>
                <Link
                  href="/cart"
                  className="cart-link"
                  onClick={closeMenu}
                  aria-label={`Cart with ${items.length} ${
                    items.length === 1 ? "item" : "items"
                  }`}
                >
                  <span className="bag-icon">
                    <FiShoppingBag />
                  </span>

                  {items.length > 0 && (
                    <motion.b
                      className="cart-count"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {items.length}
                    </motion.b>
                  )}

                  <span className="cart-word">Cart</span>
                </Link>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}