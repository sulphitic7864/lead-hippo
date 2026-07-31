import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiFetch, formatDate, formatMoney } from "@/lib/api";
import type { PublicLead } from "@/types";
import { PurchaseActions } from "@/components/PurchaseActions";
import { AnimatedReveal } from "@/components/AnimatedReveal";
import { OpportunityGallery } from "@/components/OpportunityGallery";
import { formatTimeline } from "@/utils/page";

async function load(code: string) {
  try {
    return await apiFetch<PublicLead>(`/leads/${code}`);
  } catch {
    return null;
  }
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ leadCode: string }>;
}): Promise<Metadata> {
  const { leadCode } = await params;
  const lead = await load(leadCode);
  return lead
    ? {
        title: `${lead.title} in ${lead.city}`,
        description: lead.description.slice(0, 155),
      }
    : { title: "Opportunity not found" };
}
export default async function OpportunityDetail({
  params,
}: {
  params: Promise<{ leadCode: string }>;
}) {
  const { leadCode } = await params;
  const lead = await load(leadCode);
  if (!lead) notFound();
  const sold = lead.status === "SOLD_OUT" || lead.spotsRemaining === 0;
  return (
    <>
      <AnimatedReveal>
        <section className="detail-top">
          <div className="wrap">
            <Link href="/opportunities" className="back-link">
              ← All opportunities
            </Link>
            <div className="detail-grid">
              <OpportunityGallery lead={lead} sold={sold} />

              <aside className="purchase-panel">
                <span className="trade-pill">{lead.trade.name}</span>
                <h1>{lead.title}</h1>
                <p className="detail-location">
                  <Image
                    src="/assets/location.png"
                    alt=""
                    width={18}
                    height={18}
                  />
                  {lead.city}, {lead.region}
                </p>
                <div className="price-row">
                  <strong>{formatMoney(lead.priceCents)}</strong>
                  <span>per access spot</span>
                </div>
                <div className="availability">
                  <Image
                    src="/assets/spots.png"
                    alt=""
                    width={22}
                    height={22}
                  />
                  <b>
                    {sold
                      ? "Sold out"
                      : `${lead.spotsRemaining} ${lead.spotsRemaining === 1 ? "spot" : "spots"} remaining`}
                  </b>
                </div>
                <PurchaseActions lead={lead} />
                <p className="secure-note">
                  <Image
                    src="/assets/icon-lock.png"
                    alt=""
                    width={20}
                    height={20}
                  />
                  Secure Stripe Checkout. Card details never touch our server.
                </p>
                <p className="fine-print">
                  By purchasing, you agree to the{" "}
                  <Link href="/terms">Terms</Link> and{" "}
                  <Link href="/refunds">Refund Policy</Link>.
                </p>
              </aside>
            </div>
          </div>
        </section>
      </AnimatedReveal>
      <AnimatedReveal>
        <section className="section detail-content">
          <div className="wrap detail-columns">
            <article>
              <h2>Project overview</h2>
              <p>{lead.description}</p>
              <div className="detail-facts">
                <div>
                  <span>Budget</span>
                  <strong>
                    {formatMoney(lead.budgetMinCents)} –{" "}
                    {formatMoney(lead.budgetMaxCents)}
                  </strong>
                </div>
                <div>
                  <span>Timeline</span>
                  <strong>{formatTimeline(lead.timeline)}</strong>
                </div>
                <div>
                  <span>Posted</span>
                  <strong>{formatDate(lead.publishedAt)}</strong>
                </div>
                <div>
                  <span>Lead ID</span>
                  <strong>{lead.leadCode}</strong>
                </div>
              </div>
              <h2>Why this scored high</h2>
              <ul className="check-list">
                {lead.scoreReasons.length ? (
                  lead.scoreReasons.map((r) => <li key={r}>{r}</li>)
                ) : (
                  <li>Verified directly with the homeowner</li>
                )}
              </ul>
            </article>
            <aside className="included-card">
              <h2>What you receive</h2>
              <ul className="check-list">
                <li>Homeowner name</li>
                <li>Direct phone number</li>
                <li>Email where supplied</li>
                <li>Project scope and budget</li>
                <li>Timeline and preferred contact</li>
                <li>Project photos</li>
              </ul>
              <div className="notice">
                <strong>Maximum three contractors</strong>
                <p>
                  Lead Hippo does not collect or provide a street address.
                  Purchasing access does not guarantee that you will win the
                  work.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </AnimatedReveal>

      <script
        dangerouslySetInnerHTML={{
          __html: `
      document.addEventListener("click", function (event) {
        const thumbnail = event.target.closest(".gallery-thumbnail");

        if (!thumbnail) return;

        const mainImage = document.getElementById("main-project-image");
        const imageUrl = thumbnail.getAttribute("data-image-url");

        if (mainImage && imageUrl) {
          mainImage.style.opacity = "0";

          setTimeout(function () {
            mainImage.src = imageUrl;
            mainImage.style.opacity = "1";
          }, 150);
        }
      });
    `,
        }}
      />
    </>
  );
}
