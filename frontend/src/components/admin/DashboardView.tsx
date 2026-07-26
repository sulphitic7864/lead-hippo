"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, formatMoney } from "@/lib/api";
import { LeadsTable } from "./LeadsTable";
export function DashboardView() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    apiFetch("/admin/dashboard").then(setData).catch(console.error);
  }, []);
  if (!data) return <div className="admin-panel">Loading dashboard…</div>;
  const cards = [
    ["Active Leads", data.active, "/admin/leads"],
    ["Drafts", data.drafts, "/admin/leads"],
    ["Sold Out", data.sold_out, "/admin/leads"],
    ["Total Sales", data.sales, "/admin/purchases"],
    ["Revenue", formatMoney(Number(data.revenue || 0)), "/admin/purchases"],
    ["New Contacts", data.contacts, "/admin/contacts"],
    ["Open Claims", data.refunds, "/admin/refunds"],
  ];
  return (
    <>
      {/* <div className="admin-page-title">
        <div>
          <span>OVERVIEW</span>
          <h1>Dashboard</h1>
        </div>
        <Link className="button" href="/admin/leads/new">
          + Add Opportunity
        </Link>
      </div> */}
      <div className="stat-grid">
        {cards.map(([label, value, href]) => (
          <Link href={String(href)} key={String(label)}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>Open →</small>
          </Link>
        ))}
      </div>
      <section className="admin-panel">
        <LeadsTable />
      </section>
    </>
  );
}
