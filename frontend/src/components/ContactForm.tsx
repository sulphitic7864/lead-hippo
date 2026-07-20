"use client";
import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
export function ContactForm() {
  const [state, setState] = useState<{
    loading: boolean;
    message: string;
    error: boolean;
  }>({ loading: false, message: "", error: false });
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ loading: true, message: "", error: false });
    try {
      const result = await apiFetch<{ message: string }>("/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });
      form.reset();
      setState({ loading: false, message: result.message, error: false });
    } catch (error) {
      setState({
        loading: false,
        message:
          error instanceof Error ? error.message : "Unable to send message.",
        error: true,
      });
    }
  }
  return (
    <form className="form-card" onSubmit={submit}>
      <div className="form-row">
        <label>
          Name
          <input name="name" required minLength={2} />
        </label>
        <label>
          Company
          <input name="company" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" required />
        </label>
      </div>
      <label>
        Message
        <textarea name="message" rows={7} required minLength={10} />
      </label>
      <button className="button" disabled={state.loading}>
        {state.loading ? "Sending…" : "Send Message"}
      </button>
      {state.message && (
        <p
          className={
            state.error ? "form-message error" : "form-message success"
          }
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
