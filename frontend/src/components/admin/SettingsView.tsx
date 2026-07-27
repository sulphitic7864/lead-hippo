"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export function SettingsView() {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const load = () => apiFetch<any[]>("/admin/settings").then(setRows);

  useEffect(() => {
    load();
  }, []);

  async function save(key: string, value: string) {
    await apiFetch(`/admin/settings/${key}`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    });

    setMessage(`${key} saved.`);
    await load();
  }

  async function updatePassword() {
    setMessage("");

    if (password.new.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password.new !== password.confirm) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      await apiFetch("/admin/settings/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.new,
        }),
      });

      setMessage("Password updated successfully.");

      setPassword({
        current: "",
        new: "",
        confirm: "",
      });
    } catch (error: any) {
      setMessage(error.message || "Unable to update password.");
    }
  }

  return (
    <>
      <div className="admin-page-title">
        <div>
          <span>CONFIGURATION</span>
          <h1>Settings</h1>
        </div>
      </div>

      {message && <p className="form-message">{message}</p>}

      <section className="admin-panel">
        <h2>Update Admin Password</h2>

        <div className="password-form">
          {[
            ["current", "Current Password"],
            ["new", "New Password"],
            ["confirm", "Confirm Password"],
          ].map(([key, label]) => (
            <div className="password-field" key={key}>
              <label>
                {label}

                <input
                  type={show[key as keyof typeof show] ? "text" : "password"}
                  value={password[key as keyof typeof password]}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      [key]: e.target.value,
                    })
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShow({
                      ...show,
                      [key]: !show[key as keyof typeof show],
                    })
                  }
                >
                  {show[key as keyof typeof show] ? "Hide" : "Show"}
                </button>
              </label>
            </div>
          ))}

          <button className="button" onClick={updatePassword}>
            Update Password
          </button>
        </div>
      </section>

      <section className="admin-panel settings-list">
        {rows.map((r) => (
          <label key={r.setting_key}>
            <span>
              <strong>{r.setting_key}</strong>

              <small>
                {r.is_public ? "Public setting" : "Private setting"}
              </small>
            </span>

            <input
              defaultValue={r.setting_value}
              onBlur={(e) => save(r.setting_key, e.target.value)}
            />
          </label>
        ))}
      </section>

      <section className="admin-panel">
        <h2>Environment-only settings</h2>

        <p>
          Stripe keys, SMTP credentials, upload paths, domains and cookie
          settings are intentionally managed in <code>.env</code>.
        </p>
      </section>
    </>
  );
}
