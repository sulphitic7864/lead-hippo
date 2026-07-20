import Link from "next/link";
const replacements: Record<string, string> = {
  "[BUSINESS LEGAL NAME]":
    process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME || "Lead Hippo",
  "[CONTACT EMAIL]":
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "leads@leadhippo.ca",
  "[PHONE]": process.env.NEXT_PUBLIC_CONTACT_PHONE || "contact email above",
  "[BUSINESS ADDRESS OR REGION]":
    process.env.NEXT_PUBLIC_BUSINESS_REGION || "Ontario, Canada",
  "[DATE]": process.env.NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE || "To be confirmed",
  "[X] months": "6 months",
  "[7]": "7",
  "[12]": "12",
  "Available purchase spots are displayed on each listing and decrease with each completed sale. Spots are allocated on a first-come, first-served basis at the moment payment is completed.":
    "Available purchase spots are displayed on each listing. Starting checkout temporarily reserves a spot for a limited period; the purchase is final only when Stripe confirms successful payment. Expired or cancelled reservations are released automatically.",
  "Approved claims receive a replacement credit equal to the full purchase price, applied to any opportunity of equal or lesser value (or the difference payable for a pricier one). Credits are valid for ninety (90) days.":
    "Approved claims receive either a manually issued replacement opportunity of comparable value or a refund to the original payment method, as determined under this policy. V1 does not maintain account-credit balances.",
  "[SUMMARY OF REFUND POLICY — e.g., replacement lead or refund where the homeowner cannot be reached within a defined period and the issue is reported within a defined window. Insert final policy here.]":
    "A replacement opportunity or refund may be available when the homeowner cannot be reached within five business days and the issue is reported within seven days, subject to the Refund Policy.",
};
function replace(text: string) {
  return Object.entries(replacements).reduce(
    (v, [from, to]) => v.split(from).join(to),
    text,
  );
}
export function LegalDocument({ paragraphs }: { paragraphs: string[] }) {
  return (
    <article className="legal-document">
      {paragraphs.map((raw, i) => {
        const text = replace(raw);
        if (i === 0)
          return (
            <p className="legal-kicker" key={i}>
              {text}
            </p>
          );
        if (i === 1) return <h1 key={i}>{text}</h1>;
        if (/^\d+\./.test(text)) return <h2 key={i}>{text}</h2>;
        if (text.startsWith("TEMPLATE NOTICE"))
          return (
            <div className="legal-notice" key={i}>
              {text}
            </div>
          );
        return <p key={i}>{text}</p>;
      })}
      <div className="legal-links">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refunds">Refunds</Link>
        <Link href="/disclaimers">Disclaimers</Link>
      </div>
    </article>
  );
}
