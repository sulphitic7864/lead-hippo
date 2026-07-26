"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { apiFetch } from "@/lib/api";

const links = [
  ["/admin", "Overview"],
  ["/admin/leads", "Leads"],
  ["/admin/purchases", "Purchases"],
  ["/admin/contacts", "Contacts"],
  ["/admin/refunds", "Refunds"],
  ["/admin/trades", "Trades"],
  ["/admin/settings", "Settings"],
];

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();

  const [user, setUser] = useState<{ displayName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    apiFetch<any>("/admin/auth/me")
      .then(setUser)
      .catch(() => router.replace("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading)
    return <div className="admin-loading">Checking admin session…</div>;

  if (!user) return null;

  return (
    <div className="admin-layout">
      {/* Mobile Hamburger */}
      <button
        className="admin-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <HiX /> : <HiMenu />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link href="/admin" className="admin-brand">
          Lead <b>Hippo</b>
          <small>ADMIN</small>
        </Link>

        <nav>
          {links.map(([href, label]) => (
            <Link
              className={path === href ? "active" : ""}
              href={href}
              key={href}
              onClick={() => setSidebarOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={async () => {
            await apiFetch("/admin/auth/logout", {
              method: "POST",
              body: "{}",
            });

            router.replace("/admin/login");
          }}
        >
          Sign out
        </button>
      </aside>

      <div className="admin-main">
        <header>
          <div>
            <span>Lead Hippo Administration</span>
            <strong>{user.displayName}</strong>
          </div>

          <Link href="/" target="_blank">
            View public site ↗
          </Link>
        </header>

        {children}
      </div>
    </div>
  );
}
