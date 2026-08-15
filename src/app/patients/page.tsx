import { Suspense } from "react";
import PatientsClient from "./PatientsClient";

export default function PatientsPage() {
  return (
    <Suspense
      fallback={
        <div className="panel">
          <div className="empty">Loading patient registry…</div>
        </div>
      }
    >
      <PatientsClient />
    </Suspense>
  );
}
