"use client";
import { useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
export function CancelClient({ checkoutId }: { checkoutId?: string }) {
  useEffect(() => {
    if (checkoutId)
      apiFetch(`/checkout/${checkoutId}/cancel`, {
        method: "POST",
        body: "{}",
      }).catch(() => {});
  }, [checkoutId]);
  return (
    <div className="status-card">
      <div className="status-icon muted">×</div>
      <h1>Checkout cancelled</h1>
      <p>
        No payment was recorded. Any temporary spot reservation is being
        released, and the opportunity remains in your cart if it is still
        available.
      </p>
      <div>
        <Link className="button" href="/cart">
          Return to Cart
        </Link>
        <Link className="button button-outline" href="/opportunities">
          Browse Opportunities
        </Link>
      </div>
    </div>
  );
}
