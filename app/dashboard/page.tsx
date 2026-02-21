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

  async function callProfile() {
    const user = auth.currentUser;
    if (!user) {
      alert("No current user. Please login again.");
      return;
    }

    // ✅ This is the REAL Firebase ID token your backend needs
    const idToken = await user.getIdToken(true);

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.cognispark.tech";

    const res = await fetch(`${baseUrl}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    const text = await res.text();
    alert(`Status: ${res.status}\n\n${text}`);
  }

  return (
    <Protected>
      <main style={{ padding: 24 }}>
        <h1>Dashboard</h1>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button onClick={callProfile}>Test /profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, opacity: 0.8 }}>
          API: {process.env.NEXT_PUBLIC_API_BASE_URL || "(not set)"}
        </p>
      </main>
    </Protected>
  );
}