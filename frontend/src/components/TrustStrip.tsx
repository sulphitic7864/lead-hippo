import Image from "next/image";
const items = [
  [
    "/assets/trust-verified.svg",
    "Verified Homeowners",
    "We speak to every homeowner",
  ],
  ["/assets/trust-consent.svg", "Consent to Share", "Homeowner approved"],
  ["/assets/trust-projects.svg", "Real Projects", "Not scraped. Not bots."],
  [
    "/assets/trust-quality.svg",
    "Quality Over Quantity",
    "3 contractors per opportunity",
  ],
];
export function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="wrap trust-grid">
        {items.map(([src, title, text]) => (
          <div className="trust-item" key={title}>
            <Image src={src} alt="" width={54} height={54} />
            <strong>{title}</strong>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
