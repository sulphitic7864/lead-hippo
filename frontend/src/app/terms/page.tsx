import type { Metadata } from "next";
import paragraphs from "@/content/terms.json";
import { LegalDocument } from "@/components/LegalDocument";
export const metadata: Metadata = { title: "Terms of Service" };
export default function Page() {
  return (
    <section className="section legal-page">
      <div className="wrap">
        <LegalDocument paragraphs={paragraphs} />
      </div>
    </section>
  );
}
