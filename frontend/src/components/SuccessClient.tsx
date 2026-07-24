"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";

export function SuccessClient() {
  const { clear } = useCart();

  useEffect(() => {
    localStorage.removeItem("leadhippo_cart");
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="status-card success-status">
      <div className="status-icon">✓</div>

      <h1>Payment received</h1>

      <p>
        Check your inbox—your Opportunity Report is being generated and sent.
        Stripe will also send your payment receipt.
      </p>

      <p>
        Delivery normally takes less than two minutes. Check spam or contact
        support if it does not arrive.
      </p>

      <div>
        <Link className="button" href="/opportunities">
          Browse More Opportunities
        </Link>

        <Link className="button button-outline" href="/contact">
          Contact Support
        </Link>
      </div>
    </div>
  );
}