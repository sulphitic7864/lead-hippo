"use client";
import { useRouter } from "next/navigation";
import type { PublicLead } from "@/types";
import { useCart } from "./CartProvider";
export function PurchaseActions({ lead }: { lead: PublicLead }) {
  const cart = useCart();
  const router = useRouter();
  const sold = lead.status === "SOLD_OUT" || lead.spotsRemaining === 0;
  const add = () => {
    cart.add(lead);
  };
  return (
    <div className="purchase-actions">
      <button
        className="button"
        disabled={sold}
        onClick={() => {
          add();
          router.push("/cart");
        }}
      >
        {sold ? "Sold Out" : "Buy Now"}
      </button>
      <button
        className="button button-outline"
        disabled={sold || cart.has(lead.leadCode)}
        onClick={add}
      >
        {cart.has(lead.leadCode) ? "Added to Cart" : "Add to Cart"}
      </button>
    </div>
  );
}
