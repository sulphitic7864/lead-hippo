"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="section status-page">
      <div className="wrap narrow">
        <div className="status-card">
          <h1>Something went wrong</h1>
          <p>
            Please try again. No payment or spot change occurs unless Stripe
            confirms a successful checkout.
          </p>
          <button className="button" onClick={reset}>
            Try Again
          </button>
        </div>
      </div>
    </section>
  );
}
