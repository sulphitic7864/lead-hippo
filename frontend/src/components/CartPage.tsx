"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "./CartProvider";
import { apiFetch, formatMoney } from "@/lib/api";

export function CartPage() {
  const cart = useCart();
  const [state, setState] = useState({ loading: false, error: "" });

  const total = cart.items.reduce((s, i) => s + i.priceCents, 0);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ loading: true, error: "" });

    const form = new FormData(e.currentTarget);

    try {
      const result = await apiFetch<{ checkoutUrl: string }>("/checkout", {
        method: "POST",
        body: JSON.stringify({
          leadCodes: cart.items.map((i) => i.leadCode),
          companyName: form.get("companyName"),
          email: form.get("email"),
          phone: form.get("phone"),
          marketingConsent: form.get("marketingConsent") === "on",
          acceptedTerms: form.get("acceptedTerms") === "on",
        }),
      });

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setState({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Checkout could not be started.",
      });
    }
  }

  if (!cart.items.length)
    return (
      <motion.div
        className="empty-cart"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1>Your cart is empty</h1>

        <p>
          Add an available opportunity to continue to secure Stripe Checkout.
        </p>

        <motion.div
          style={{ display: "inline-block" }}
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
        >
          <Link className="button" href="/opportunities">
            Browse Opportunities
          </Link>
        </motion.div>
      </motion.div>
    );

  return (
    <motion.div
      className="wrap cart-layout"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <section>
        <h1>Your opportunity cart</h1>

        <p>
          One spot is reserved for each item only after checkout starts.
          Complete payment before the reservation expires.
        </p>

        <motion.div
          className="cart-items"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
        >
          {cart.items.map((item) => (
            <motion.article
              key={item.leadCode}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 20,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.45,
                    ease: "easeOut",
                  },
                },
              }}
              whileHover={{ y: -4 }}
            >
              {item.photo ? (
                <img src={item.photo} alt="" />
              ) : (
                <div className="cart-placeholder" />
              )}

              <div>
                <span>{item.leadCode}</span>
                <h3>{item.title}</h3>
                <p>
                  {item.city}, {item.region}
                </p>
              </div>

              <strong>{formatMoney(item.priceCents)}</strong>

              <motion.button
                type="button"
                onClick={() => cart.remove(item.leadCode)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Remove
              </motion.button>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <motion.aside
        className="checkout-card"
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.55,
          delay: 0.15,
          ease: "easeOut",
        }}
      >
        <h2>Checkout details</h2>

        <form onSubmit={submit}>
          <label>
            Company name
            <input name="companyName" required minLength={2} />
          </label>

          <label>
            Email
            <input name="email" type="email" required />
          </label>

          <label>
            Phone
            <input name="phone" type="tel" required />
          </label>

          <label className="check-control">
            <input name="acceptedTerms" type="checkbox" required />

            <span>
              I agree to the <Link href="/terms">Terms</Link>,{" "}
              <Link href="/privacy">Privacy Policy</Link> and{" "}
              <Link href="/refunds">Refund Policy</Link>.
            </span>
          </label>

          <label className="check-control">
            <input name="marketingConsent" type="checkbox" />

            <span>
              Email me when new opportunities become available. Optional.
            </span>
          </label>

          <div className="cart-total">
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>

          <motion.button
            className="button full"
            disabled={state.loading}
            whileHover={state.loading ? {} : { y: -3, scale: 1.02 }}
            whileTap={state.loading ? {} : { scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {state.loading ? "Opening Stripe…" : "Proceed to Secure Checkout"}
          </motion.button>

          {state.error && (
            <motion.p
              className="form-message error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {state.error}
            </motion.p>
          )}

          <p className="fine-print">
            Each opportunity can be purchased only once per company. Taxes may
            be added by Stripe where configured.
          </p>
        </form>
      </motion.aside>
    </motion.div>
  );
}