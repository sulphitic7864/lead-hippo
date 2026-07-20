import type { Metadata } from "next";
import { CartPage } from "@/components/CartPage";
export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};
export default function Cart() {
  return (
    <section className="section cart-page">
      <CartPage />
    </section>
  );
}
