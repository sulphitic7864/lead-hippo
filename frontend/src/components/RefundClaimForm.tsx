"use client";
import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
export function RefundClaimForm() {
  const [state, setState] = useState({
    loading: false,
    message: "",
    error: false,
  });
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget,
      d = new FormData(f);
    setState({ loading: true, message: "", error: false });
    try {
      const result = await apiFetch<{ message: string }>("/refund-claims", {
        method: "POST",
        body: JSON.stringify({
          purchaseId: d.get("purchaseId"),
          email: d.get("email"),
          reason: d.get("reason"),
          contractorMessage: d.get("contractorMessage"),
          contactAttemptLog: d.get("contactAttemptLog"),
        }),
      });
      f.reset();
      setState({ loading: false, message: result.message, error: false });
    } catch (error) {
      setState({
        loading: false,
        message:
          error instanceof Error ? error.message : "Unable to submit claim.",
        error: true,
      });
    }
  }
  return (
    <form className="form-card" onSubmit={submit}>
      <div className="form-row">
        <label>
          Purchase ID
          <input name="purchaseId" type="number" min="1" required />
        </label>
        <label>
          Checkout email
          <input name="email" type="email" required />
        </label>
      </div>
      <label>
        Reason
        <select name="reason" required>
          <option value="UNREACHABLE">Homeowner unreachable</option>
          <option value="INVALID_CONTACT">Invalid contact information</option>
          <option value="PROJECT_CANCELLED_BEFORE_CONTACT">
            Project cancelled before contact
          </option>
          <option value="DUPLICATE_CHARGE">Duplicate charge</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      <label>
        What happened?
        <textarea name="contractorMessage" rows={5} minLength={10} required />
      </label>
      <label>
        Contact attempts
        <textarea
          name="contactAttemptLog"
          rows={5}
          placeholder="List dates, times and methods used."
        />
      </label>
      <button className="button" disabled={state.loading}>
        {state.loading ? "Submitting…" : "Submit Claim"}
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
