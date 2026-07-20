import Image from "next/image";
const steps = [
  [
    "/assets/icon-1-browse.png",
    "Browse Opportunities",
    "View verified homeowner projects in your area",
  ],
  [
    "/assets/icon-2-purchase.png",
    "Purchase Access",
    "Buy the opportunity and secure your spot",
  ],
  [
    "/assets/icon-3-details.png",
    "Get the Details",
    "Receive contact information and project details",
  ],
  [
    "/assets/icon-4-contact.png",
    "Contact & Quote",
    "Reach the homeowner and grow your business",
  ],
];
export function HowItWorks() {
  return (
    <section id="how-it-works" className="section how">
      <div className="wrap">
        <div className="section-heading centered">
          <span>THE SIMPLE PROCESS</span>
          <h2>How Lead Hippo Works</h2>
        </div>
        <div className="steps">
          {steps.map(([src, title, text], i) => (
            <div className="step" key={title}>
              <b>{i + 1}</b>
              <Image src={src} alt="" width={112} height={112} />
              <h3>{title}</h3>
              <p>{text}</p>
              {i < steps.length - 1 && <span className="step-arrow">→</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
