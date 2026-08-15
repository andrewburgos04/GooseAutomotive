import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel">
      <div className="panel-body" style={{ textAlign: "center", padding: "2.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", marginTop: 0 }}>
          Chart not found
        </h1>
        <p className="muted">That patient record is not in the demo dataset.</p>
        <Link className="btn btn-primary" href="/patients">
          Back to patients
        </Link>
      </div>
    </div>
  );
}
