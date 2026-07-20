import type { Metadata } from "next";
import { CancelClient } from "@/components/CancelClient";
export const metadata: Metadata = {
  title: "Checkout Cancelled",
  robots: { index: false },
};
export default async function Cancel({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string }>;
}) {
  const q = await searchParams;
  return (
    <section className="section status-page">
      <div className="wrap narrow">
        <CancelClient checkoutId={q.checkout_id} />
      </div>
    </section>
  );
}
