import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { adminLogoutAction } from "@/lib/actions";
import { isAdminAuthenticated } from "@/lib/auth";
import { listTickets } from "@/lib/tickets";

export const metadata: Metadata = {
  title: "Admin inbox",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const tickets = await listTickets();

  return (
    <div className="page-shell">
      <div className="page-intro" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Support inbox</h1>
          <p>
            Triage client tickets, update status, and leave public or internal
            notes.
          </p>
        </div>
        <form action={adminLogoutAction}>
          <button className="btn btn--ghost" type="submit">
            Sign out
          </button>
        </form>
      </div>
      <AdminDashboard tickets={tickets} />
    </div>
  );
}
