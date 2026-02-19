"use client";

import { Protected } from "../../lib/Protected";
import { useAuth } from "../../lib/auth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <Protected>
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Dashboard</h1>
        <p>Signed in as: <b>{user?.email}</b></p>

        <button onClick={logout} style={{ padding: 12 }}>
          Logout
        </button>
      </main>
    </Protected>
  );
}
