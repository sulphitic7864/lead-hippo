import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { SiteChrome } from "@/components/SiteChrome";
export const metadata: Metadata = {
  metadataBase: new URL("https://leadhippo.ca"),

  title: {
    default: "Lead Hippo — Verified Renovation Opportunities",
    template: "%s — Lead Hippo",
  },

  description:
    "Verified homeowner renovation opportunities for Canadian contractors. Maximum three contractors per opportunity.",

  icons: {
    icon: "/assets/mascot.png",
    shortcut: "/assets/mascot.png",
    apple: "/assets/mascot.png",
  },

  openGraph: {
    title: "Lead Hippo",
    description: "More Leads. More Jobs. More Growth.",
    url: "https://leadhippo.ca",
    siteName: "Lead Hippo",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
