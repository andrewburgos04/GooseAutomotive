import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">TechSync staff</p>
        <h1>Admin sign in</h1>
        <p>
          Manage the client support inbox. Default local password is{" "}
          <code>techsync-admin</code> unless <code>ADMIN_PASSWORD</code> is set.
        </p>
      </div>
      <div className="panel" style={{ maxWidth: 420 }}>
        <AdminLoginForm />
      </div>
    </div>
  );
}
