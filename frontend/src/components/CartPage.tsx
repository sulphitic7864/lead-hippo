"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
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
      <div className="empty-cart">
        <h1>Your cart is empty</h1>
        <p>
          Add an available opportunity to continue to secure Stripe Checkout.
        </p>
        <Link className="button" href="/opportunities">
          Browse Opportunities
        </Link>
      </div>
    );
  return (
    <div className="wrap cart-layout">
      <section>
        <h1>Your opportunity cart</h1>
        <p>
          One spot is reserved for each item only after checkout starts.
          Complete payment before the reservation expires.
        </p>
        <div className="cart-items">
          {cart.items.map((item) => (
            <article key={item.leadCode}>
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
              <button onClick={() => cart.remove(item.leadCode)}>Remove</button>
            </article>
          ))}
        </div>
      </section>
      <aside className="checkout-card">
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
          <button className="button full" disabled={state.loading}>
            {state.loading ? "Opening Stripe…" : "Proceed to Secure Checkout"}
          </button>
          {state.error && <p className="form-message error">{state.error}</p>}
          <p className="fine-print">
            Each opportunity can be purchased only once per company. Taxes may
            be added by Stripe where configured.
          </p>
        </form>
      </aside>
    </div>
  );
}
