import type { Metadata } from "next";
import { SuccessClient } from "@/components/SuccessClient";
export const metadata: Metadata = {
  title: "Purchase Successful",
  robots: { index: false },
};
export default function Success() {
  return (
    <section className="section status-page">
      <div className="wrap narrow">
        <SuccessClient />
      </div>
    </section>
  );
}
