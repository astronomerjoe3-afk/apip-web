"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getIdTokenResult, User, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "../../lib/firebase";
import { apipGet } from "../../lib/apipApi";

type Role = "student" | "instructor" | "admin" | "unknown";

type StudentRow = {
  uid: string;
  email?: string;
  display_name?: string;
  module_id: string;
  mastery_score: number;
  readiness: string;
  last_event_utc?: string;
  top_misconceptions: Array<{ tag: string; p: number }>;
  last_diagnostic?: { score: number | null; utc?: string };
  last_transfer?: { score: number | null; utc?: string };
};

type ApiResp = {
  ok: boolean;
  utc?: string;
  module_id: string;
  students: StudentRow[];
  warnings?: string[];
};

function pct(v: number | null | undefined) {
  if (typeof v !== "number") return "-";
  const x = Math.round(Math.max(0, Math.min(1, v)) * 100);
  return `${x}%`;
}

export default function InstructorPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("unknown");

  const [moduleId, setModuleId] = useState<string>("F1");
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [err, setErr] = useState<string>("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole("unknown");
        setLoading(false);
        router.replace("/");
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(u, true);
        const r = (tokenResult.claims?.role as Role) || "unknown";
        setRole(r);

        if (r === "student") router.replace("/student");
        else if (r === "unknown") router.replace("/dashboard");
        // instructor/admin may stay here
      } catch {
        setRole("unknown");
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  async function doLogout() {
    await signOut(auth);
    router.replace("/");
  }

  async function load() {
    try {
      setErr("");
      setWarnings([]);
      const data = await apipGet<ApiResp>(`/instructor/module/${encodeURIComponent(moduleId)}/students?limit=50`);
      setRows(data.students || []);
      setWarnings(data.warnings || []);
    } catch (e: any) {
      setErr(String(e?.message || e));
      setRows([]);
    }
  }

  useEffect(() => {
    if (role === "instructor" || role === "admin") {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, moduleId]);

  const header = useMemo(() => {
    return role === "admin" ? "Instructor View (Admin)" : "Instructor View";
  }, [role]);

  if (loading) {
    return <div style={{ padding: 24, opacity: 0.85 }}>Loading…</div>;
  }

  if (!(role === "instructor" || role === "admin")) {
    return <div style={{ padding: 24, opacity: 0.85 }}>Redirecting…</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ fontSize: 44, fontWeight: 950, letterSpacing: -0.5 }}>{header}</div>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Signed in as <b>{user?.email}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={doLogout} style={{ height: 40, padding: "0 14px", borderRadius: 12, fontWeight: 800 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontWeight: 900 }}>Module:</div>
        <input
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value.trim().toUpperCase())}
          style={{ height: 40, borderRadius: 12, padding: "0 12px", width: 120, fontWeight: 800 }}
        />
        <button onClick={load} style={{ height: 40, padding: "0 14px", borderRadius: 12, fontWeight: 800 }}>
          Refresh
        </button>
      </div>

      {err ? (
        <div style={{ marginTop: 14, border: "1px solid #800", padding: 12, borderRadius: 14 }}>
          <b>Error:</b> {err}
        </div>
      ) : null}

      {warnings?.length ? (
        <div style={{ marginTop: 14, border: "1px solid #444", padding: 12, borderRadius: 14, opacity: 0.9 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Warnings</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {warnings.slice(0, 6).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div style={{ marginTop: 16, border: "1px solid #333", borderRadius: 18, overflow: "hidden" }}>
        <div style={{ padding: 14, fontWeight: 950, fontSize: 18, borderBottom: "1px solid #333" }}>
          Students ({rows.length})
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "rgba(255,255,255,0.03)" }}>
                <th style={th}>Student</th>
                <th style={th}>Mastery</th>
                <th style={th}>Readiness</th>
                <th style={th}>Last Diagnostic</th>
                <th style={th}>Last Scored Task</th>
                <th style={th}>Likely Misconceptions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.uid} style={{ borderTop: "1px solid #222" }}>
                  <td style={td}>
                    <div style={{ fontWeight: 900 }}>{r.email || r.uid}</div>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>UID: {r.uid}</div>
                  </td>

                  <td style={td}>
                    <div style={{ fontWeight: 950, fontSize: 16 }}>{pct(r.mastery_score)}</div>
                  </td>

                  <td style={td}>
                    <div style={{ fontWeight: 900 }}>{r.readiness || "-"}</div>
                  </td>

                  <td style={td}>
                    <div style={{ fontWeight: 900 }}>{pct(r.last_diagnostic?.score ?? null)}</div>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>{r.last_diagnostic?.utc || ""}</div>
                  </td>

                  <td style={td}>
                    <div style={{ fontWeight: 900 }}>{pct(r.last_transfer?.score ?? null)}</div>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>{r.last_transfer?.utc || ""}</div>
                  </td>

                  <td style={td}>
                    {r.top_misconceptions?.length ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {r.top_misconceptions.slice(0, 6).map((m, i) => (
                          <span
                            key={i}
                            style={{
                              border: "1px solid #333",
                              borderRadius: 999,
                              padding: "6px 10px",
                              fontSize: 12,
                              fontWeight: 900,
                              opacity: 0.95,
                            }}
                            title={`p=${m.p}`}
                          >
                            {m.tag} ({Math.round(m.p * 100)}%)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ opacity: 0.7 }}>—</div>
                    )}
                  </td>
                </tr>
              ))}

              {rows.length === 0 ? (
                <tr>
                  <td style={{ ...td, opacity: 0.8 }} colSpan={6}>
                    No student rows yet. Make sure students exist in Firestore `users` with role="student",
                    and that they have logged at least one diagnostic/transfer.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: 12,
  fontSize: 13,
  fontWeight: 950,
  opacity: 0.9,
  borderBottom: "1px solid #333",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: 12,
  verticalAlign: "top",
};