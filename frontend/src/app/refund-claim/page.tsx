import type { Metadata } from "next";
import Link from "next/link";
import { RefundClaimForm } from "@/components/RefundClaimForm";
export const metadata: Metadata = {
  title: "Submit a Refund Claim",
  robots: { index: false },
};
export default function RefundClaim() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span>PURCHASE SUPPORT</span>
          <h1>Submit a Refund or Replacement Claim</h1>
          <p>
            Claims normally must be submitted within seven days of purchase.
            Review the <Link href="/refunds">Refund Policy</Link> first.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap narrow">
          <RefundClaimForm />
        </div>
      </section>
    </>
  );
}
