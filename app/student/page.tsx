"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apipGet } from "../../lib/apipApi";

type Module = {
  id: string;
  title?: string;
  description?: string;
  estimated_minutes?: number;
  level?: string;
};

export default function StudentHomePage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await apipGet<{ ok: boolean; modules: Module[] }>("/modules");
        setModules(data.modules || []);
      } catch (e: any) {
        setErr(String(e?.message || e));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 36, marginBottom: 12 }}>Student</h1>
      <p style={{ opacity: 0.8, marginBottom: 18 }}>
        Choose a module to begin.
      </p>

      {err ? (
        <div style={{ border: "1px solid #800", padding: 12, borderRadius: 10, marginBottom: 16 }}>
          <b>Error:</b> {err}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12 }}>
        {modules.map((m) => (
          <div key={m.id} style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {m.title || m.id}
                </div>
                <div style={{ opacity: 0.8, marginTop: 6 }}>
                  {m.description || ""}
                </div>
                <div style={{ opacity: 0.75, marginTop: 8, fontSize: 13 }}>
                  {m.level ? `Level: ${m.level} • ` : ""}
                  {m.estimated_minutes ? `Est: ${m.estimated_minutes} min` : ""}
                </div>
              </div>

              <div style={{ minWidth: 120, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <Link href={`/student/module/${encodeURIComponent(m.id)}`}>
                  <button>Open</button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* If no modules in DB, give a direct link to F1 */}
        {modules.length === 0 ? (
          <div style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>No modules returned.</div>
            <Link href="/student/module/F1"><button>Open F1</button></Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}