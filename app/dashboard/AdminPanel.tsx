"use client";

import React, { useCallback, useMemo, useState } from "react";
import { apipFetch, ApiError } from "@/lib/apip";

// ---- Types (defensive; matches your API payloads) ----
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
  active?: boolean;
  scopes?: string[];
  created_at_utc?: string;
  last_used_at_utc?: string | null;
  total_requests?: number;
  // rate limit policy (optional)
  rl_window_limit?: number;
  rl_window_seconds?: number;
  rl_bucket_seconds?: number;
  rl_daily_limit?: number;
};

type CreateKeyPayload = {
  label: string;
  scopes: string[];
  rl_window_limit: number;
  rl_window_seconds: number;
  rl_bucket_seconds: number;
  rl_daily_limit: number;
};

type PatchKeyPayload = Partial<Pick<CreateKeyPayload, "rl_window_limit" | "rl_window_seconds" | "rl_bucket_seconds" | "rl_daily_limit">>;

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
    const msg = (ae as any).message ?? "Request failed";
    const detail = (ae as any).detail;
    return `HTTP ${status}: ${msg}\n${fmtJson(detail)}`;
  }
  return String(e?.message ?? e);
}

function parseCsv(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function toInt(v: string, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export default function AdminPanel({ token }: { token: string }) {
  // ---- shared UI state ----
  const [busy, setBusy] = useState(false);

  // ---- metrics ----
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsErr, setMetricsErr] = useState("");

  // ---- keys list ----
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysErr, setKeysErr] = useState("");
  const [limit, setLimit] = useState(20);

  // ---- create key ----
  const [newLabel, setNewLabel] = useState("web-admin-created");
  const [newScopes, setNewScopes] = useState("profile:read");
  const [newWinLimit, setNewWinLimit] = useState("10");
  const [newWinSeconds, setNewWinSeconds] = useState("60");
  const [newBucketSeconds, setNewBucketSeconds] = useState("10");
  const [newDailyLimit, setNewDailyLimit] = useState("500");
  const [createOut, setCreateOut] = useState<any>(null);
  const [createErr, setCreateErr] = useState("");

  // ---- selected key ----
  const [selectedKeyId, setSelectedKeyId] = useState("");
  const [selectedKey, setSelectedKey] = useState<KeyRecord | null>(null);
  const [selectedErr, setSelectedErr] = useState("");

  // ---- patch limits ----
  const [patchWinLimit, setPatchWinLimit] = useState("5");
  const [patchWinSeconds, setPatchWinSeconds] = useState("60");
  const [patchBucketSeconds, setPatchBucketSeconds] = useState("10");
  const [patchDailyLimit, setPatchDailyLimit] = useState("200");
  const [patchOut, setPatchOut] = useState<any>(null);
  const [patchErr, setPatchErr] = useState("");

  const canMutate = !!token && !busy;

  // ================
  // API calls
  // ================
  const loadMetrics = useCallback(async () => {
    setBusy(true);
    setMetricsErr("");
    try {
      const m = await apipFetch<Metrics>("/admin/metrics", { token, query: { top_n: 10 } });
      setMetrics(m);
    } catch (e) {
      setMetricsErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [token]);

  const loadKeys = useCallback(async () => {
    setBusy(true);
    setKeysErr("");
    try {
      // FIX: keys listing is an admin endpoint
      const ks = await apipFetch<KeyRecord[]>("/admin/keys", { token, query: { limit } });
      setKeys(Array.isArray(ks) ? ks : []);
    } catch (e) {
      setKeysErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [token, limit]);

  const createKey = useCallback(async () => {
    setBusy(true);
    setCreateErr("");
    setCreateOut(null);
    try {
      const payload: CreateKeyPayload = {
        label: newLabel.trim() || "web-admin-created",
        scopes: parseCsv(newScopes),
        rl_window_limit: toInt(newWinLimit, 10),
        rl_window_seconds: toInt(newWinSeconds, 60),
        rl_bucket_seconds: toInt(newBucketSeconds, 10),
        rl_daily_limit: toInt(newDailyLimit, 500),
      };
      const out = await apipFetch<any>("/keys", { token, method: "POST", body: payload });
      setCreateOut(out);
      // refresh list after create
      await loadKeys();
    } catch (e) {
      setCreateErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [
    token,
    newLabel,
    newScopes,
    newWinLimit,
    newWinSeconds,
    newBucketSeconds,
    newDailyLimit,
    loadKeys,
  ]);

  const fetchKey = useCallback(async () => {
    const keyId = selectedKeyId.trim();
    if (!keyId) return;
    setBusy(true);
    setSelectedErr("");
    setSelectedKey(null);
    try {
      // If you have a dedicated endpoint for a key, use it.
      // Common patterns:
      // - GET /keys/{key_id}
      // - GET /admin/keys/{key_id}
      // We'll try /keys/{key_id} as used for other key actions.
      const k = await apipFetch<KeyRecord>(`/keys/${encodeURIComponent(keyId)}`, { token });
      setSelectedKey(k);
      // preload patch form from fetched key policy if present
      if (k?.rl_window_limit != null) setPatchWinLimit(String(k.rl_window_limit));
      if (k?.rl_window_seconds != null) setPatchWinSeconds(String(k.rl_window_seconds));
      if (k?.rl_bucket_seconds != null) setPatchBucketSeconds(String(k.rl_bucket_seconds));
      if (k?.rl_daily_limit != null) setPatchDailyLimit(String(k.rl_daily_limit));
    } catch (e) {
      setSelectedErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [token, selectedKeyId]);

  const enableKey = useCallback(async () => {
    const keyId = selectedKeyId.trim();
    if (!keyId) return;
    setBusy(true);
    setSelectedErr("");
    try {
      await apipFetch<any>(`/keys/${encodeURIComponent(keyId)}/enable`, { token, method: "POST" });
      await fetchKey();
      await loadKeys();
    } catch (e) {
      setSelectedErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [token, selectedKeyId, fetchKey, loadKeys]);

  const disableKey = useCallback(async () => {
    const keyId = selectedKeyId.trim();
    if (!keyId) return;
    setBusy(true);
    setSelectedErr("");
    try {
      await apipFetch<any>(`/keys/${encodeURIComponent(keyId)}/disable`, { token, method: "POST" });
      await fetchKey();
      await loadKeys();
    } catch (e) {
      setSelectedErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [token, selectedKeyId, fetchKey, loadKeys]);

  const resetCounters = useCallback(async () => {
    const keyId = selectedKeyId.trim();
    if (!keyId) return;
    setBusy(true);
    setSelectedErr("");
    try {
      await apipFetch<any>(`/keys/${encodeURIComponent(keyId)}/reset-counters`, { token, method: "POST" });
      await fetchKey();
      await loadKeys();
    } catch (e) {
      setSelectedErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [token, selectedKeyId, fetchKey, loadKeys]);

  const patchRateLimit = useCallback(async () => {
    const keyId = selectedKeyId.trim();
    if (!keyId) return;
    setBusy(true);
    setPatchErr("");
    setPatchOut(null);
    try {
      const payload: PatchKeyPayload = {
        rl_window_limit: toInt(patchWinLimit, 5),
        rl_window_seconds: toInt(patchWinSeconds, 60),
        rl_bucket_seconds: toInt(patchBucketSeconds, 10),
        rl_daily_limit: toInt(patchDailyLimit, 200),
      };
      const out = await apipFetch<any>(`/keys/${encodeURIComponent(keyId)}`, {
        token,
        method: "PATCH",
        body: payload,
      });
      setPatchOut(out);
      await fetchKey();
      await loadKeys();
    } catch (e) {
      setPatchErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [
    token,
    selectedKeyId,
    patchWinLimit,
    patchWinSeconds,
    patchBucketSeconds,
    patchDailyLimit,
    fetchKey,
    loadKeys,
  ]);

  const keysTable = useMemo(() => {
    return keys.map((k) => (
      <tr key={k.key_id} style={{ borderTop: "1px solid #333" }}>
        <td style={{ padding: "8px 6px" }}>
          <button
            disabled={!canMutate}
            onClick={() => {
              setSelectedKeyId(k.key_id);
              setSelectedKey(null);
              setSelectedErr("");
            }}
            style={{ cursor: canMutate ? "pointer" : "not-allowed" }}
          >
            {k.key_id}
          </button>
        </td>
        <td style={{ padding: "8px 6px" }}>{k.label ?? ""}</td>
        <td style={{ padding: "8px 6px" }}>{k.active ? "true" : "false"}</td>
        <td style={{ padding: "8px 6px" }}>{k.total_requests ?? 0}</td>
      </tr>
    ));
  }, [keys, canMutate]);

  // ================
  // UI
  // ================
  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 28, marginBottom: 12 }}>Admin Console</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button disabled={!canMutate} onClick={loadMetrics}>
          Refresh metrics
        </button>
        <button disabled={!canMutate} onClick={loadKeys}>
          Refresh keys
        </button>
        {busy ? <span style={{ opacity: 0.8 }}>Working…</span> : null}
      </div>

      {/* Metrics */}
      <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12, marginBottom: 16 }}>
        <h3 style={{ fontSize: 20, marginBottom: 8 }}>Metrics</h3>
        {metricsErr ? <pre style={{ color: "salmon", whiteSpace: "pre-wrap" }}>{metricsErr}</pre> : null}
        <pre style={{ whiteSpace: "pre-wrap" }}>{metrics ? fmtJson(metrics) : "{}"}</pre>
      </div>

      {/* Create Key */}
      <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12, marginBottom: 16 }}>
        <h3 style={{ fontSize: 20, marginBottom: 10 }}>Create API Key</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Label
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} style={{ width: "100%" }} />
          </label>

          <label>
            Scopes (comma-separated)
            <input value={newScopes} onChange={(e) => setNewScopes(e.target.value)} style={{ width: "100%" }} />
          </label>

          <label>
            Window limit
            <input value={newWinLimit} onChange={(e) => setNewWinLimit(e.target.value)} style={{ width: "100%" }} />
          </label>

          <label>
            Window seconds
            <input value={newWinSeconds} onChange={(e) => setNewWinSeconds(e.target.value)} style={{ width: "100%" }} />
          </label>

          <label>
            Bucket seconds
            <input
              value={newBucketSeconds}
              onChange={(e) => setNewBucketSeconds(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Daily limit
            <input
              value={newDailyLimit}
              onChange={(e) => setNewDailyLimit(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <button disabled={!canMutate} onClick={createKey}>
            Create
          </button>
        </div>

        {createErr ? <pre style={{ color: "salmon", whiteSpace: "pre-wrap" }}>{createErr}</pre> : null}
        {createOut ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700 }}>Create result</div>
            <pre style={{ whiteSpace: "pre-wrap" }}>{fmtJson(createOut)}</pre>
          </div>
        ) : null}
      </div>

      {/* Keys list */}
      <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12, marginBottom: 16 }}>
        <h3 style={{ fontSize: 20, marginBottom: 10 }}>Keys</h3>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Limit:
            <input
              style={{ width: 90 }}
              value={String(limit)}
              onChange={(e) => setLimit(toInt(e.target.value, 20))}
            />
          </label>
          <button disabled={!canMutate} onClick={loadKeys}>
            Load
          </button>
        </div>

        {keysErr ? <pre style={{ color: "salmon", whiteSpace: "pre-wrap" }}>{keysErr}</pre> : null}

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #333" }}>
              <th align="left" style={{ padding: "6px" }}>
                key_id
              </th>
              <th align="left" style={{ padding: "6px" }}>
                label
              </th>
              <th align="left" style={{ padding: "6px" }}>
                active
              </th>
              <th align="left" style={{ padding: "6px" }}>
                requests
              </th>
            </tr>
          </thead>
          <tbody>
            {keys.length ? (
              keysTable
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: "8px 6px", opacity: 0.85 }}>
                  (no keys loaded)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Selected key */}
      <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
        <h3 style={{ fontSize: 20, marginBottom: 10 }}>Selected key</h3>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            placeholder="key_id"
            value={selectedKeyId}
            onChange={(e) => setSelectedKeyId(e.target.value)}
            style={{ width: 320 }}
          />
          <button disabled={!canMutate || !selectedKeyId.trim()} onClick={fetchKey}>
            Fetch
          </button>
          <button disabled={!canMutate || !selectedKeyId.trim()} onClick={enableKey}>
            Enable
          </button>
          <button disabled={!canMutate || !selectedKeyId.trim()} onClick={disableKey}>
            Disable
          </button>
          <button disabled={!canMutate || !selectedKeyId.trim()} onClick={resetCounters}>
            Reset counters
          </button>
        </div>

        {selectedErr ? <pre style={{ color: "salmon", whiteSpace: "pre-wrap" }}>{selectedErr}</pre> : null}
        {selectedKey ? (
          <pre style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{fmtJson(selectedKey)}</pre>
        ) : null}

        <div style={{ marginTop: 14, borderTop: "1px solid #333", paddingTop: 12 }}>
          <h4 style={{ fontSize: 18, marginBottom: 8 }}>Patch rate limit</h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              Window limit
              <input value={patchWinLimit} onChange={(e) => setPatchWinLimit(e.target.value)} style={{ width: "100%" }} />
            </label>

            <label>
              Window seconds
              <input
                value={patchWinSeconds}
                onChange={(e) => setPatchWinSeconds(e.target.value)}
                style={{ width: "100%" }}
              />
            </label>

            <label>
              Bucket seconds
              <input
                value={patchBucketSeconds}
                onChange={(e) => setPatchBucketSeconds(e.target.value)}
                style={{ width: "100%" }}
              />
            </label>

            <label>
              Daily limit
              <input
                value={patchDailyLimit}
                onChange={(e) => setPatchDailyLimit(e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
          </div>

          <div style={{ marginTop: 10 }}>
            <button disabled={!canMutate || !selectedKeyId.trim()} onClick={patchRateLimit}>
              Patch
            </button>
          </div>

          {patchErr ? <pre style={{ color: "salmon", whiteSpace: "pre-wrap" }}>{patchErr}</pre> : null}
          {patchOut ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 700 }}>Patch result</div>
              <pre style={{ whiteSpace: "pre-wrap" }}>{fmtJson(patchOut)}</pre>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}