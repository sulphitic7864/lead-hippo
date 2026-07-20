import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
export const metadata: Metadata = { title: "Contact Us" };
export default function Contact() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "leads@leadhippo.ca";
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span>WE ARE HERE TO HELP</span>
          <h1>Contact Us</h1>
          <p>
            Questions about an opportunity, purchase or homeowner consent? Send
            us the details.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap contact-grid">
          <div>
            <h2>Talk to Lead Hippo</h2>
            <p>
              For purchase support, include your Lead ID and the email used at
              checkout.
            </p>
            <div className="contact-detail">
              <span>Email</span>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
            <div className="contact-detail">
              <span>Service area</span>
              <strong>
                {process.env.NEXT_PUBLIC_BUSINESS_REGION || "Ontario, Canada"}
              </strong>
            </div>
            <div className="contact-detail">
              <span>Homeowner removal</span>
              <p>
                Homeowners may use this form to withdraw consent. We will
                archive the listing and stop future sales.
              </p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
