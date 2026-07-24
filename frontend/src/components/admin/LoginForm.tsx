"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { apiFetch } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState({
    loading: false,
    error: "",
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setState({
      loading: true,
      error: "",
    });

    try {
      await apiFetch("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Login failed.",
      });
    }
  }

  return (
    <form className="admin-login-card" onSubmit={submit}>
      <div className="admin-login-brand">
        Lead <b>Hippo</b>
      </div>

      <h1>Admin sign in</h1>

      <p>Secure access to lead, purchase and contact management.</p>

      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </label>

      <label>
        Password

        <div className="admin-password-field">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={8}
          />

          <button
            type="button"
            className="admin-password-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </label>

      <button
        type="submit"
        className="button full"
        disabled={state.loading}
      >
        {state.loading ? "Signing in…" : "Sign In"}
      </button>

      {state.error && (
        <p className="form-message error">{state.error}</p>
      )}

      <small>
        The default development credentials are documented in
        database/seed.sql. Change them before deployment.
      </small>
    </form>
  );
}