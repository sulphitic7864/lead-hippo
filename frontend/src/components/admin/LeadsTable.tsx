"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AdminLead } from "@/types";
import { apiFetch, formatMoney, formatDate } from "@/lib/api";
import { FaStar } from "react-icons/fa";

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
          {/* <span>INVENTORY</span> */}
          <h2>Leads</h2>
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
                <th>Spots</th>
                <th>Score</th>
                <th>Price</th>
                <th>Published</th>
                <th>Featured</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    {console.log("leads data", l)}
                    <strong>{l.title}</strong>
                    <small>
                      {l.leadCode} · {l.city}, {l.region}
                    </small>
                  </td>
                  <td>
                    <span className={`status status-${l.status.toLowerCase()}`}>
                      {l.status}
                      {l.isNew && <small> . New</small>}
                    </span>
                  </td>
                  <td>
                    <span className="">
                      {l.spotsRemaining}/{l.spotsTotal}
                    </span>
                  </td>
                  <td>{l?.hippoScore}</td>
                  <td>{formatMoney(l?.priceCents)}</td>
                  <td>{formatDate(l?.publishedAt)}</td>
                  <td>
                    <FaStar
                      className={
                        l.isFeatured ? "featured-star active" : "featured-star"
                      }
                    />
                  </td>
                  <td>{l.viewCount}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        className="action-pill edit-pill"
                        href={`/admin/leads/${l.id}`}
                      >
                        Edit
                      </Link>

                      {l.status === "DRAFT" && (
                        <button
                          className="action-pill publish-pill"
                          onClick={() => action(l.id, "publish")}
                        >
                          Publish
                        </button>
                      )}

                      {l.status === "ACTIVE" && (
                        <button
                          className="action-pill sold-pill"
                          onClick={() => action(l.id, "sold-out")}
                        >
                          Sold Out
                        </button>
                      )}

                      {l.status !== "ARCHIVED" && (
                        <button
                          className="action-pill archive-pill"
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
