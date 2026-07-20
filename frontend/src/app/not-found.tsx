import Link from "next/link";
export default function NotFound() {
  return (
    <section className="section status-page">
      <div className="wrap narrow">
        <div className="status-card">
          <div className="status-code">404</div>
          <h1>Page not found</h1>
          <p>
            The page or opportunity may have been moved, sold out or archived.
          </p>
          <Link className="button" href="/opportunities">
            Browse Opportunities
          </Link>
        </div>
      </div>
    </section>
  );
}
