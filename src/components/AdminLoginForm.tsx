"use client";

import { useActionState } from "react";
import { adminLoginAction, type ActionResult } from "@/lib/actions";

const initial: ActionResult | null = null;

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    adminLoginAction,
    initial,
  );

  return (
    <form action={formAction} className="ticket-form admin-login-form">
      <label>
        <span>Admin password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>

      {state?.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
