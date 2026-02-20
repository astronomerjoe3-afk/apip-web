"use client";

import Protected from "../../lib/Protected";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <Protected>
      <main style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </main>
    </Protected>
  );
}
