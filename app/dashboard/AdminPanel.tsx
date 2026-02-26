"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apipFetch, ApiError } from "@/lib/apip";

// ---- Types (match your API payloads defensively) ----
type Metrics = {
  ok: boolean;
  utc: string;
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
  total_requests?: number;
  rate_limit?: {
    rl_window_limit?: number;
    rl_window_seconds?: number;
    rl_bucket_seconds?: number;
    rl_daily_limit?: number;
  };
};

type KeysListResponse = { ok: boolean; count?: number; keys?: KeyRecord[] };
type KeyGetResponse = { ok: boolean; key?: KeyRecord } | { ok: boolean; key_id?: string; key?: KeyRecord };

function fmtJson(x: any) {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
}

function errToString(e: any) {
  const ae = e as ApiError;
  if (ae && typeof ae.status === "number") {
    return `HTTP ${ae.status}: ${ae.message}\n${fmtJson(ae.detail)}`;
  }
  return String(e);
}

export default function AdminPanel({ token }: { token: string }) {
  // ---- state ----
  const [busy, setBusy] = useState(false);

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsErr, setMetricsErr] = useState<string>("");

  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysErr, setKeysErr] = useState<string>("");
  const [limit, setLimit] = useState(20);

  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<KeyRecord | null>(null);
  const [selectedErr, setSelectedErr] = useState<string>("");

  // Create key form
  const [label, setLabel] = useState("web-admin-created");
  const [scopes, setScopes] = useState("profile:read");
  const [rlWindowLimit, setRlWindowLimit] = useState(10);
  const [rlWindowSeconds, setRlWindowSeconds] = useState(60);
  const [rlBucketSeconds, setRlBucketSeconds] = useState(10);
  const [rlDailyLimit, setRlDailyLimit] = useState(500);
  const [createResult, setCreateResult] = useState<any>(null);
  const [createErr, setCreateErr] = useState<string>("");

  // Patch rate limit
  const [patchWindowLimit, setPatchWindowLimit] = useState<number>(5);
  const [patchWindowSeconds, setPatchWindowSeconds] = useState<number>(60);
  const [patchBucketSeconds, setPatchBucketSeconds] = useState<number>(10);
  const [patchDailyLimit, setPatchDailyLimit] = useState<number>(200);
  const [patchErr, setPatchErr] = useState<string>("");
  const [patchResult, setPatchResult] = useState<any>(null);

  const canActOnKey = useMemo(() => Boolean(selectedKeyId?.trim()), [selectedKeyId]);

  async function loadMetrics() {
    setMetricsErr("");
    try {
      const m = await apipFetch<Metrics>("/admin/metrics", { token, query: { top_n: 10 } });
      setMetrics(m);
    } catch (e) {
      setMetricsErr(errToString(e));
    }
  }

  async function loadKeys() {
    setKeysErr("");
    try {
      const r = await apipFetch<KeysListResponse>("/keys", { token, query: { limit } });
      setKeys(r.keys ?? []);
    } catch (e) {
      setKeysErr(errToString(e));
    }
  }

  async function loadKey(keyId: string) {
    setSelectedErr("");
    setSelectedKey(null);
    try {
      const r = await apipFetch<KeyGetResponse>(`/keys/${encodeURIComponent(keyId)}`, { token });
      const k = (r as any).key ?? (r as any);
      setSelectedKey(k);
    } catch (e) {
      setSelectedErr(errToString(e));
    }
  }

  useEffect(() => {
    // initial
    void loadMetrics();
    void loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreateKey() {
    setBusy(true);
    setCreateErr("");
    setCreateResult(null);
    try {
      const body = {
        label,
        scopes: scopes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        rl_window_limit: rlWindowLimit,
        rl_window_seconds: rlWindowSeconds,
        rl_bucket_seconds: rlBucketSeconds,
        rl_daily_limit: rlDailyLimit,
      };

      const r = await apipFetch<any>("/keys", { method: "POST", token, body });
      setCreateResult(r);

      // refresh lists/metrics
      await loadKeys();
      await loadMetrics();
    } catch (e) {
      setCreateErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }

  async function onPatchRateLimit() {
    if (!canActOnKey) return;
    setBusy(true);
    setPatchErr("");
    setPatchResult(null);
    try {
      const body = {
        rl_window_limit: patchWindowLimit,
        rl_window_seconds: patchWindowSeconds,
        rl_bucket_seconds: patchBucketSeconds,
        rl_daily_limit: patchDailyLimit,
      };
      const r = await apipFetch<any>(`/keys/${encodeURIComponent(selectedKeyId)}/rate-limit`, {
        method: "PATCH",
        token,
        body,
      });
      setPatchResult(r);

      await loadKey(selectedKeyId);
      await loadKeys();
      await loadMetrics();
    } catch (e) {
      setPatchErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }

  async function onEnableKey() {
    if (!canActOnKey) return;
    setBusy(true);
    setSelectedErr("");
    try {
      await apipFetch<any>(`/keys/${encodeURIComponent(selectedKeyId)}/enable`, {
        method: "POST",
        token,
      });
      await loadKey(selectedKeyId);
      await loadKeys();
      await loadMetrics();
    } catch (e) {
      setSelectedErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }

  async function onDisableKey() {
    // If your API implements /disable, this will work. If not, you’ll see a clear 404 in UI.
    if (!canActOnKey) return;
    setBusy(true);
    setSelectedErr("");
    try {
      await apipFetch<any>(`/keys/${encodeURIComponent(selectedKeyId)}/disable`, {
        method: "POST",
        token,
      });
      await loadKey(selectedKeyId);
      await loadKeys();
      await loadMetrics();
    } catch (e) {
      setSelectedErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }

  async function onResetCounters() {
    if (!canActOnKey) return;
    setBusy(true);
    setSelectedErr("");
    try {
      await apipFetch<any>(`/keys/${encodeURIComponent(selectedKeyId)}/reset-counters`, {
        method: "POST",
        token,
      });
      await loadKey(selectedKeyId);
      await loadMetrics();
    } catch (e) {
      setSelectedErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Admin Console</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <button disabled={busy} onClick={loadMetrics}>
          Refresh metrics
        </button>
        <button disabled={busy} onClick={loadKeys}>
          Refresh keys
        </button>
      </div>

      {/* METRICS */}
      <section style={{ border: "1px solid #444", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 650, marginBottom: 10 }}>Metrics</h3>
        {metricsErr ? (
          <pre style={{ whiteSpace: "pre-wrap", color: "#ff6b6b" }}>{metricsErr}</pre>
        ) : (
          <pre style={{ whiteSpace: "pre-wrap" }}>{metrics ? fmtJson(metrics) : "Loading..."}</pre>
        )}
      </section>

      {/* CREATE KEY */}
      <section style={{ border: "1px solid #444", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 650, marginBottom: 10 }}>Create API Key</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 760 }}>
          <label>
            Label
            <input value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label>
            Scopes (comma-separated)
            <input value={scopes} onChange={(e) => setScopes(e.target.value)} />
          </label>

          <label>
            Window limit
            <input type="number" value={rlWindowLimit} onChange={(e) => setRlWindowLimit(Number(e.target.value))} />
          </label>
          <label>
            Window seconds
            <input
              type="number"
              value={rlWindowSeconds}
              onChange={(e) => setRlWindowSeconds(Number(e.target.value))}
            />
          </label>

          <label>
            Bucket seconds
            <input
              type="number"
              value={rlBucketSeconds}
              onChange={(e) => setRlBucketSeconds(Number(e.target.value))}
            />
          </label>
          <label>
            Daily limit
            <input type="number" value={rlDailyLimit} onChange={(e) => setRlDailyLimit(Number(e.target.value))} />
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <button disabled={busy} onClick={onCreateKey}>
            Create
          </button>
        </div>

        {createErr ? (
          <pre style={{ whiteSpace: "pre-wrap", color: "#ff6b6b", marginTop: 10 }}>{createErr}</pre>
        ) : null}
        {createResult ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 650, marginBottom: 6 }}>
              Created — copy the API key now (you may only show it once depending on your API policy).
            </div>
            <pre style={{ whiteSpace: "pre-wrap" }}>{fmtJson(createResult)}</pre>
          </div>
        ) : null}
      </section>

      {/* LIST KEYS + SELECT */}
      <section style={{ border: "1px solid #444", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 650, marginBottom: 10 }}>Keys</h3>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label>
            Limit:
            <input
              style={{ width: 90, marginLeft: 8 }}
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </label>
          <button disabled={busy} onClick={loadKeys}>
            Load
          </button>
        </div>

        {keysErr ? <pre style={{ whiteSpace: "pre-wrap", color: "#ff6b6b" }}>{keysErr}</pre> : null}

        <div style={{ marginTop: 10, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #555", padding: 8 }}>key_id</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #555", padding: 8 }}>label</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #555", padding: 8 }}>active</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #555", padding: 8 }}>requests</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.key_id} style={{ borderBottom: "1px solid #333" }}>
                  <td style={{ padding: 8 }}>
                    <button
                      disabled={busy}
                      onClick={() => {
                        setSelectedKeyId(k.key_id);
                        void loadKey(k.key_id);
                        // seed patch form from current
                        setPatchWindowLimit(k.rate_limit?.rl_window_limit ?? 5);
                        setPatchWindowSeconds(k.rate_limit?.rl_window_seconds ?? 60);
                        setPatchBucketSeconds(k.rate_limit?.rl_bucket_seconds ?? 10);
                        setPatchDailyLimit(k.rate_limit?.rl_daily_limit ?? 200);
                      }}
                    >
                      {k.key_id}
                    </button>
                  </td>
                  <td style={{ padding: 8 }}>{k.label ?? ""}</td>
                  <td style={{ padding: 8 }}>{String(k.active ?? "")}</td>
                  <td style={{ padding: 8 }}>{String(k.total_requests ?? "")}</td>
                </tr>
              ))}
              {keys.length === 0 ? (
                <tr>
                  <td style={{ padding: 8 }} colSpan={4}>
                    (no keys loaded)
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* SELECTED KEY ACTIONS */}
      <section style={{ border: "1px solid #444", borderRadius: 10, padding: 14 }}>
        <h3 style={{ fontSize: 18, fontWeight: 650, marginBottom: 10 }}>Selected key</h3>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            style={{ minWidth: 320 }}
            placeholder="key_id"
            value={selectedKeyId}
            onChange={(e) => setSelectedKeyId(e.target.value)}
          />
          <button disabled={busy || !canActOnKey} onClick={() => loadKey(selectedKeyId)}>
            Fetch
          </button>
          <button disabled={busy || !canActOnKey} onClick={onEnableKey}>
            Enable
          </button>
          <button disabled={busy || !canActOnKey} onClick={onDisableKey}>
            Disable
          </button>
          <button disabled={busy || !canActOnKey} onClick={onResetCounters}>
            Reset counters
          </button>
        </div>

        {selectedErr ? <pre style={{ whiteSpace: "pre-wrap", color: "#ff6b6b" }}>{selectedErr}</pre> : null}
        {selectedKey ? <pre style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{fmtJson(selectedKey)}</pre> : null}

        <div style={{ marginTop: 14 }}>
          <h4 style={{ fontSize: 16, fontWeight: 650, marginBottom: 8 }}>Patch rate limit</h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 760 }}>
            <label>
              Window limit
              <input
                type="number"
                value={patchWindowLimit}
                onChange={(e) => setPatchWindowLimit(Number(e.target.value))}
              />
            </label>
            <label>
              Window seconds
              <input
                type="number"
                value={patchWindowSeconds}
                onChange={(e) => setPatchWindowSeconds(Number(e.target.value))}
              />
            </label>
            <label>
              Bucket seconds
              <input
                type="number"
                value={patchBucketSeconds}
                onChange={(e) => setPatchBucketSeconds(Number(e.target.value))}
              />
            </label>
            <label>
              Daily limit
              <input
                type="number"
                value={patchDailyLimit}
                onChange={(e) => setPatchDailyLimit(Number(e.target.value))}
              />
            </label>
          </div>

          <div style={{ marginTop: 10 }}>
            <button disabled={busy || !canActOnKey} onClick={onPatchRateLimit}>
              Patch
            </button>
          </div>

          {patchErr ? <pre style={{ whiteSpace: "pre-wrap", color: "#ff6b6b" }}>{patchErr}</pre> : null}
          {patchResult ? <pre style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{fmtJson(patchResult)}</pre> : null}
        </div>
      </section>
    </div>
  );
}