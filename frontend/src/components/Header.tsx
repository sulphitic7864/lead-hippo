"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
export function Header() {
  const [open, setOpen] = useState(false);
  const { items } = useCart();
  return (
    <header className="site-header">
      <div className="wrap nav-inner">
        <Link href="/" className="brand">
          <Image
            src="/assets/logo.png"
            alt="Lead Hippo"
            width={176}
            height={80}
            priority
          />
        </Link>
        <button
          className="menu-button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          className={open ? "main-nav open" : "main-nav"}
          onClick={() => setOpen(false)}
        >
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/opportunities">Opportunities</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link
            href="/cart"
            className="cart-link"
            aria-label={`Cart with ${items.length} items`}
          >
            <span className="bag-icon">▢</span>
            {items.length > 0 && <b>{items.length}</b>}
            <span className="cart-word">Cart</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
