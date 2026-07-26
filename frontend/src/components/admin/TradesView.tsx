"use client";
import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
export function TradesView() {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const load = () => apiFetch<any[]>("/admin/trades").then(setRows);
  useEffect(() => {
    load();
  }, []);
  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const f = new FormData(e.currentTarget);

    try {
      await apiFetch("/admin/trades", {
        method: "POST",
        body: JSON.stringify({
          name: f.get("name"),
        }),
      });

      e.currentTarget.reset();
      setMessageType("success");
      setMessage("Trade added successfully.");
      await load();
    } catch (error: any) {
      setMessageType("error");
      setMessage(error?.message == "Request failed (409)" ? "Trade already exists." : error?.message);
    }
  }
  async function update(id: number, data: any) {
    await apiFetch(`/admin/trades/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    setMessage("Trade updated.");
    await load();
  }
  return (
    <>
      <div className="admin-page-title">
        <div>
          <span>PROJECT TYPES</span>
          <h1>Trades</h1>
        </div>
      </div>
      {message && <p className={`form-message ${messageType}`}>{message}</p>}
      <section className="admin-panel">
        <form className="inline-admin-form" onSubmit={add}>
          <label>
            New trade
            <input
              name="name"
              required
              minLength={2}
              placeholder="Example: Windows"
            />
          </label>
          <button className="button">Add Trade</button>
        </form>
      </section>
      <section className="admin-panel table-panel">
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Sort</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <input defaultValue={r.name} id={`trade-name-${r.id}`} />
                  </td>
                  <td>{r.slug}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      defaultValue={r.sort_order}
                      id={`trade-sort-${r.id}`}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      defaultChecked={Boolean(r.is_active)}
                      id={`trade-active-${r.id}`}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        update(r.id, {
                          name: (
                            document.getElementById(
                              `trade-name-${r.id}`,
                            ) as HTMLInputElement
                          ).value,
                          sortOrder: Number(
                            (
                              document.getElementById(
                                `trade-sort-${r.id}`,
                              ) as HTMLInputElement
                            ).value,
                          ),
                          isActive: (
                            document.getElementById(
                              `trade-active-${r.id}`,
                            ) as HTMLInputElement
                          ).checked,
                        })
                      }
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
