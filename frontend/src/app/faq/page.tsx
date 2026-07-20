import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "@/content/faq";
export const metadata: Metadata = { title: "FAQ" };
export default function FAQ() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span>STRAIGHT ANSWERS</span>
          <h1>Frequently Asked Questions</h1>
          <p>How verification, spots, reports and refunds work.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap faq-layout">
          <div className="accordion">
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>
                  {f.q}
                  <b>+</b>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <aside className="help-card">
            <h2>Still have a question?</h2>
            <p>
              Send our team a message and include the opportunity ID when your
              question relates to a listing or purchase.
            </p>
            <Link className="button" href="/contact">
              Contact Lead Hippo
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
