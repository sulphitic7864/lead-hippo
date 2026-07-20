"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AdminLead } from "@/types";
import { apiFetch, formatMoney, formatDate } from "@/lib/api";
export function LeadsTable() {
  const [leads, setLeads] = useState<AdminLead[]>([]),
    [message, setMessage] = useState("");
  const load = useCallback(
    () =>
      apiFetch<AdminLead[]>("/admin/leads")
        .then(setLeads)
        .catch((e) => setMessage(e.message)),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);
  async function action(id: number, path: string, body: any = {}) {
    setMessage("");
    try {
      await apiFetch(`/admin/leads/${id}/${path}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Action failed.");
    }
  }
  return (
    <>
      <div className="admin-page-title">
        <div>
          <span>INVENTORY</span>
          <h1>Lead Management</h1>
        </div>
        <Link className="button" href="/admin/leads/new">
          + Add Lead
        </Link>
      </div>
      {message && <p className="form-message error">{message}</p>}
      <section className="admin-panel table-panel">
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Status</th>
                <th>Price</th>
                <th>Spots</th>
                <th>Published</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <strong>{l.title}</strong>
                    <small>
                      {l.leadCode} · {l.city}, {l.region}
                    </small>
                  </td>
                  <td>
                    <span className={`status status-${l.status.toLowerCase()}`}>
                      {l.status}
                    </span>
                    {l.isFeatured && <small>Featured</small>}
                  </td>
                  <td>{formatMoney(l.priceCents)}</td>
                  <td>
                    <select
                      value={l.spotsRemaining}
                      onChange={(e) =>
                        action(l.id, "spots", { spots: Number(e.target.value) })
                      }
                    >
                      {[0, 1, 2, 3].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>{" "}
                    / {l.spotsTotal}
                  </td>
                  <td>{formatDate(l.publishedAt)}</td>
                  <td>{l.viewCount}</td>
                  <td>
                    <div className="table-actions">
                      <Link href={`/admin/leads/${l.id}`}>Edit</Link>
                      {l.status === "DRAFT" && (
                        <button onClick={() => action(l.id, "publish")}>
                          Publish
                        </button>
                      )}
                      {l.status === "ACTIVE" && (
                        <button onClick={() => action(l.id, "sold-out")}>
                          Sold Out
                        </button>
                      )}
                      {l.status !== "ARCHIVED" && (
                        <button
                          className="danger-link"
                          onClick={() => action(l.id, "archive")}
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!leads.length && (
          <div className="empty-state">
            <p>No leads have been created.</p>
          </div>
        )}
      </section>
    </>
  );
}
