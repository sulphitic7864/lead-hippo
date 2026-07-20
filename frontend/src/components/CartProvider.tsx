"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublicLead } from "@/types";
export type CartItem = Pick<
  PublicLead,
  | "leadCode"
  | "title"
  | "city"
  | "region"
  | "priceCents"
  | "spotsRemaining"
  | "status"
> & { photo?: string };
interface CartContextValue {
  items: CartItem[];
  add: (lead: PublicLead) => void;
  remove: (code: string) => void;
  clear: () => void;
  has: (code: string) => boolean;
}
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("leadhippo_cart") || "[]"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("leadhippo_cart", JSON.stringify(items));
  }, [items, ready]);
  const value = useMemo(
    () => ({
      items,
      add: (lead: PublicLead) =>
        setItems((x) =>
          x.some((i) => i.leadCode === lead.leadCode)
            ? x
            : [
                ...x,
                {
                  leadCode: lead.leadCode,
                  title: lead.title,
                  city: lead.city,
                  region: lead.region,
                  priceCents: lead.priceCents,
                  spotsRemaining: lead.spotsRemaining,
                  status: lead.status,
                  photo: lead.photos[0]?.url,
                },
              ],
        ),
      remove: (code: string) =>
        setItems((x) => x.filter((i) => i.leadCode !== code)),
      clear: () => setItems([]),
      has: (code: string) => items.some((i) => i.leadCode === code),
    }),
    [items],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
