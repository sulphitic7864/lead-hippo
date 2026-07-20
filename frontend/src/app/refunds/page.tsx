import type { Metadata } from "next";
import paragraphs from "@/content/refunds.json";
import { LegalDocument } from "@/components/LegalDocument";
export const metadata: Metadata = { title: "Refund Policy" };
export default function Page() {
  return (
    <section className="section legal-page">
      <div className="wrap">
        <LegalDocument paragraphs={paragraphs} />
      </div>
    </section>
  );
}
