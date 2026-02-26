"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apipFetch, ApiError } from "@/lib/apip";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

// -----------------------------
// Types (defensive)
// -----------------------------
type Metrics = {
  ok?: boolean;
  utc?: string;
  keys?: { total?: number; active?: number; auto_disabled?: number };
  rate_limit?: any;
  posture?: any;
  warnings?: string[];
};

type KeyRecord = {
  key_id: string;
  label?: string;
  scopes?: string[];
  active?: boolean;
  created_at_utc?: string;
  last_used_at_utc?: string;
  // policy fields (optional)
  rl_window_limit?: number;
  rl_window_seconds?: number;
  rl_bucket_seconds?: number;
  rl_daily_limit?: number;
  // counters (optional)
  total_requests?: number;
  // audit-ish fields (optional)
  auto_disabled?: boolean;
};

type KeysListResponse = {
  ok?: boolean;
  keys?: KeyRecord[];
  count?: number;
};

type CreateKeyRequest = {
  label: string;
  scopes: string[];
  rl_window_limit: number;
  rl_window_seconds: number;
  rl_bucket_seconds: number;
  rl_daily_limit: number;
};

type CreateKeyResponse = {
  ok?: boolean;
  key_id?: string;
  api_key?: string; // one-time secret
  key?: KeyRecord;
};

function fmtJson(x: any) {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
}

function errToString(e: any) {
  const ae = e as ApiError;
  if (ae && typeof (ae as any).status === "number") {
    const status = (ae as any).status as number;
    const msg = (ae as any).message ?? "API error";
    const detail = (ae as any).detail;
    return `HTTP ${status}: ${msg}${detail ? `\n${fmtJson(detail)}` : ""}`;
  }
  return String(e?.message ?? e);
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

function apiBase(): string {
  // Must remain NEXT_PUBLIC_API_BASE_URL=https://api.cognispark.tech per your constraint
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
}

export default function AdminPanel() {
  const base = useMemo(() => apiBase(), []);
  const [token, setToken] = useState<string>("");

  // auth/user info
  const [meEmail, setMeEmail] = useState<string>("");
  const [authErr, setAuthErr] = useState<string>("");

  // metrics
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsErr, setMetricsErr] = useState<string>("");

  // keys
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysErr, setKeysErr] = useState<string>("");
  const [keysLoading, setKeysLoading] = useState<boolean>(false);

  // create key
  const [create, setCreate] = useState<CreateKeyRequest>({
    label: "new-key",
    scopes: ["profile:read"],
    rl_window_limit: 10,
    rl_window_seconds: 60,
    rl_bucket_seconds: 10,
    rl_daily_limit: 500,
  });
  const [createErr, setCreateErr] = useState<string>("");
  const [createdApiKey, setCreatedApiKey] = useState<string>("");
  const [createdKeyId, setCreatedKeyId] = useState<string>("");

  // selection/actions
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const selectedKey = useMemo(
    () => keys.find((k) => k.key_id === selectedKeyId) || null,
    [keys, selectedKeyId]
  );

  // -----------------------------
  // Token bootstrap
  // -----------------------------
  async function refreshToken() {
    setAuthErr("");
    try {
      const u = auth.currentUser;
      if (!u) {
        setToken("");
        setMeEmail("");
        setAuthErr("Not logged in. Please login first.");
        return;
      }
      setMeEmail(u.email || "");
      const t = await u.getIdToken(/* forceRefresh */ true);
      setToken(t);
    } catch (e) {
      setAuthErr(errToString(e));
    }
  }

  useEffect(() => {
    // keep in sync if user logs in/out
    const unsub = auth.onAuthStateChanged(() => {
      refreshToken();
    });
    refreshToken();
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // API calls
  // -----------------------------
  async function loadMetrics() {
    setMetricsErr("");
    try {
      const m = (await apipFetch("/admin/metrics", {
        token,
        query: { top_n: 10 },
      })) as Metrics;
      setMetrics(m);
    } catch (e) {
      setMetricsErr(errToString(e));
      setMetrics(null);
    }
  }

  async function loadKeys() {
    setKeysErr("");
    setKeysLoading(true);
    try {
      const r = (await apipFetch("/admin/keys", {
        token,
        query: { limit: 50 },
      })) as KeysListResponse;

      const list = Array.isArray(r?.keys) ? r.keys : [];
      setKeys(list);
      if (list.length && !selectedKeyId) setSelectedKeyId(list[0].key_id);
    } catch (e) {
      setKeysErr(errToString(e));
      setKeys([]);
    } finally {
      setKeysLoading(false);
    }
  }

  async function createKey() {
    setCreateErr("");
    setCreatedApiKey("");
    setCreatedKeyId("");
    try {
      const r = (await apipFetch("/keys", {
        token,
        method: "POST",
        body: create,
      })) as CreateKeyResponse;

      const kid = r?.key_id || r?.key?.key_id || "";
      const ak = r?.api_key || "";
      setCreatedKeyId(kid);
      setCreatedApiKey(ak);

      await loadKeys();
      if (kid) setSelectedKeyId(kid);
    } catch (e) {
      setCreateErr(errToString(e));
    }
  }

  async function enableKey(keyId: string) {
    try {
      await apipFetch(`/keys/${encodeURIComponent(keyId)}/enable`, {
        token,
        method: "POST",
      });
      await loadKeys();
    } catch (e) {
      alert(errToString(e));
    }
  }

  async function resetCounters(keyId: string) {
    try {
      await apipFetch(`/keys/${encodeURIComponent(keyId)}/reset-counters`, {
        token,
        method: "POST",
      });
      await loadKeys();
    } catch (e) {
      alert(errToString(e));
    }
  }

  async function copyAdminToken() {
    setAuthErr("");
    try {
      if (!token) {
        await refreshToken();
      }
      if (!auth.currentUser) {
        setAuthErr("Not logged in.");
        return;
      }
      const t = token || (await auth.currentUser.getIdToken(true));
      await copyToClipboard(t);
      alert("Admin ID token copied to clipboard.");
    } catch (e) {
      setAuthErr(errToString(e));
    }
  }

  async function doLogout() {
    try {
      await signOut(auth);
      setToken("");
      setMeEmail("");
      setMetrics(null);
      setKeys([]);
      setSelectedKeyId("");
      alert("Logged out.");
    } catch (e) {
      alert(errToString(e));
    }
  }

  // auto-load once token exists
  useEffect(() => {
    if (!token) return;
    loadMetrics();
    loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Admin Dashboard</h2>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div><strong>API Base:</strong> {base || "(missing NEXT_PUBLIC_API_BASE_URL)"}</div>
            <div><strong>Signed in as:</strong> {meEmail || "(none)"}</div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={refreshToken} disabled={!auth.currentUser}>
              Refresh token
            </button>
            <button onClick={copyAdminToken} disabled={!auth.currentUser}>
              Copy admin ID token
            </button>
            <button onClick={doLogout} disabled={!auth.currentUser}>
              Logout
            </button>
          </div>
        </div>

        {authErr ? (
          <pre style={{ color: "crimson", marginTop: 10, whiteSpace: "pre-wrap" }}>{authErr}</pre>
        ) : null}

        <div style={{ marginTop: 10, fontSize: 13, color: "#555" }}>
          Notes:
          <ul style={{ marginTop: 6 }}>
            <li>We do <strong>not</strong> display your token by default (security). Use “Copy admin ID token”.</li>
            <li>API keys are only shown <strong>once</strong> immediately after creation.</li>
          </ul>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Metrics</h3>
          <button onClick={loadMetrics} disabled={!token}>
            Reload metrics
          </button>
        </div>

        {metricsErr ? (
          <pre style={{ color: "crimson", marginTop: 10, whiteSpace: "pre-wrap" }}>{metricsErr}</pre>
        ) : null}

        <pre style={{ marginTop: 10, background: "#fafafa", padding: 10, borderRadius: 6, overflowX: "auto" }}>
          {metrics ? fmtJson(metrics) : "(no metrics yet)"}
        </pre>
      </div>

      {/* Create Key */}
      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Create API Key</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            Label
            <input
              style={{ width: "100%" }}
              value={create.label}
              onChange={(e) => setCreate({ ...create, label: e.target.value })}
            />
          </label>

          <label>
            Scopes (comma-separated)
            <input
              style={{ width: "100%" }}
              value={(create.scopes || []).join(",")}
              onChange={(e) =>
                setCreate({
                  ...create,
                  scopes: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>

          <label>
            Window limit
            <input
              style={{ width: "100%" }}
              type="number"
              value={create.rl_window_limit}
              onChange={(e) => setCreate({ ...create, rl_window_limit: Number(e.target.value) })}
            />
          </label>

          <label>
            Window seconds
            <input
              style={{ width: "100%" }}
              type="number"
              value={create.rl_window_seconds}
              onChange={(e) => setCreate({ ...create, rl_window_seconds: Number(e.target.value) })}
            />
          </label>

          <label>
            Bucket seconds
            <input
              style={{ width: "100%" }}
              type="number"
              value={create.rl_bucket_seconds}
              onChange={(e) => setCreate({ ...create, rl_bucket_seconds: Number(e.target.value) })}
            />
          </label>

          <label>
            Daily limit
            <input
              style={{ width: "100%" }}
              type="number"
              value={create.rl_daily_limit}
              onChange={(e) => setCreate({ ...create, rl_daily_limit: Number(e.target.value) })}
            />
          </label>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button onClick={createKey} disabled={!token}>
            Create key
          </button>
          <button onClick={loadKeys} disabled={!token}>
            Reload keys
          </button>
        </div>

        {createErr ? (
          <pre style={{ color: "crimson", marginTop: 10, whiteSpace: "pre-wrap" }}>{createErr}</pre>
        ) : null}

        {/* One-time API key panel */}
        {createdApiKey ? (
          <div style={{ marginTop: 12, padding: 12, border: "1px solid #f0c36d", borderRadius: 8, background: "#fff8e6" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <strong>ONE-TIME API KEY</strong>
                <div style={{ fontSize: 13, color: "#555" }}>
                  Copy now — it will not be shown again. Key ID: <code>{createdKeyId || "(unknown)"}</code>
                </div>
              </div>
              <button onClick={() => copyToClipboard(createdApiKey)}>Copy API key</button>
            </div>

            <pre style={{ marginTop: 10, background: "#fff", padding: 10, borderRadius: 6, overflowX: "auto" }}>
              {createdApiKey}
            </pre>
          </div>
        ) : null}
      </div>

      {/* Keys List + Actions */}
      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Keys</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {keysLoading ? <span style={{ fontSize: 13 }}>Loading…</span> : null}
            <button onClick={loadKeys} disabled={!token}>
              Reload
            </button>
          </div>
        </div>

        {keysErr ? (
          <pre style={{ color: "crimson", marginTop: 10, whiteSpace: "pre-wrap" }}>{keysErr}</pre>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12, marginTop: 10 }}>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
              Select a key
            </div>
            <select
              style={{ width: "100%", padding: 8 }}
              value={selectedKeyId}
              onChange={(e) => setSelectedKeyId(e.target.value)}
            >
              <option value="" disabled>
                (choose)
              </option>
              {keys.map((k) => (
                <option key={k.key_id} value={k.key_id}>
                  {k.key_id} — {k.label || "(no label)"} {k.active ? "" : "[disabled]"}
                </option>
              ))}
            </select>

            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => selectedKeyId && enableKey(selectedKeyId)}
                disabled={!token || !selectedKeyId}
              >
                Enable key
              </button>
              <button
                onClick={() => selectedKeyId && resetCounters(selectedKeyId)}
                disabled={!token || !selectedKeyId}
              >
                Reset counters
              </button>
            </div>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
              Selected key details
            </div>
            <pre style={{ background: "#fafafa", padding: 10, borderRadius: 6, overflowX: "auto" }}>
              {selectedKey ? fmtJson(selectedKey) : "(none selected)"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}