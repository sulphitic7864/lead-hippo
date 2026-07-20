import Image from "next/image";
import Link from "next/link";
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Image
            src="/assets/logo.png"
            alt="Lead Hippo"
            width={190}
            height={86}
            className="footer-logo"
          />
          <p>
            Verified homeowner renovation opportunities for Canadian
            contractors. Maximum three contractors per opportunity.
          </p>
          <div className="footer-badges">
            <Image
              src="/assets/badge-canadian.png"
              alt="Canadian marketplace"
              width={50}
              height={50}
            />
            <Image
              src="/assets/badge-shield.png"
              alt="Secure marketplace"
              width={50}
              height={50}
            />
          </div>
        </div>
        <div>
          <h3>Marketplace</h3>
          <Link href="/opportunities">Opportunities</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/cart">Cart</Link>
        </div>
        <div>
          <h3>Support</h3>
          <Link href="/contact">Contact Us</Link>
          <Link href="/refund-claim">Submit a Claim</Link>
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "leads@leadhippo.ca"}`}
          >
            {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "leads@leadhippo.ca"}
          </a>
        </div>
        <div>
          <h3>Legal</h3>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/refunds">Refund Policy</Link>
          <Link href="/disclaimers">Legal Disclaimers</Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} Lead Hippo. All rights reserved.
        </span>
        <span>More Leads. More Jobs. More Growth.</span>
      </div>
    </footer>
  );
}
