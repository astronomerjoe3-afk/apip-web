"use client";

import React, { useCallback, useMemo, useState } from "react";
import { apipFetch, ApiError } from "@/lib/apip";

// ---- Types (match your API payloads defensively) ----
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
  active?: boolean;
  total_requests?: number;
  created_at_utc?: string;
  last_used_at_utc?: string;
  rl_window_limit?: number;
  rl_window_seconds?: number;
  rl_bucket_seconds?: number;
  rl_daily_limit?: number;
};

function fmtJson(x: any) {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
}

function errToString(e: unknown) {
  // Prefer ApiError shape from lib/apip.ts
  const ae = e as ApiError;
  if (ae && typeof (ae as any).status === "number") {
    const status = (ae as any).status as number;
    const msg = (ae as any).message ?? "API error";
    const detail = (ae as any).detail;
    return `HTTP ${status}: ${msg}\n${fmtJson(detail)}`;
  }
  if (e instanceof Error) return e.message;
  return String(e);
}

export default function AdminPanel({ token }: { token: string }) {
  // ---- state ----
  const [busy, setBusy] = useState(false);

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsErr, setMetricsErr] = useState<string>("");

  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysErr, setKeysErr] = useState<string>("");
  const [limit, setLimit] = useState<number>(20);

  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<KeyRecord | null>(null);
  const [selectedErr, setSelectedErr] = useState<string>("");

  // Create key form
  const [newLabel, setNewLabel] = useState("web-admin-created");
  const [newScopes, setNewScopes] = useState("profile:read");
  const [newWindowLimit, setNewWindowLimit] = useState<number>(10);
  const [newWindowSeconds, setNewWindowSeconds] = useState<number>(60);
  const [newBucketSeconds, setNewBucketSeconds] = useState<number>(10);
  const [newDailyLimit, setNewDailyLimit] = useState<number>(500);
  const [createErr, setCreateErr] = useState<string>("");

  // Patch form
  const [patchWindowLimit, setPatchWindowLimit] = useState<number>(5);
  const [patchWindowSeconds, setPatchWindowSeconds] = useState<number>(60);
  const [patchBucketSeconds, setPatchBucketSeconds] = useState<number>(10);
  const [patchDailyLimit, setPatchDailyLimit] = useState<number>(200);
  const [patchErr, setPatchErr] = useState<string>("");

  const scopesArray = useMemo(
    () =>
      newScopes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [newScopes]
  );

  const refreshMetrics = useCallback(async () => {
    setBusy(true);
    setMetricsErr("");
    try {
      const m = (await apipFetch("/admin/metrics", {
        token,
        query: { top_n: 10 },
      })) as Metrics;
      setMetrics(m);
    } catch (e) {
      setMetricsErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [token]);

  const refreshKeys = useCallback(async () => {
    setBusy(true);
    setKeysErr("");
    try {
      // NOTE: API endpoint is /admin/keys (not /keys)
      const out = (await apipFetch("/admin/keys", {
        token,
        query: { limit },
      })) as any;

      // Accept either { keys: [...] } or raw array for robustness
      const arr: KeyRecord[] = Array.isArray(out) ? out : out?.keys ?? [];
      setKeys(arr);
    } catch (e) {
      setKeysErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [token, limit]);

  const fetchOneKey = useCallback(
    async (keyId: string) => {
      if (!keyId) return;
      setBusy(true);
      setSelectedErr("");
      try {
        const k = (await apipFetch(`/keys/${encodeURIComponent(keyId)}`, {
          token,
        })) as any;
        // Accept {key: {...}} or {...}
        const rec: KeyRecord = (k?.key ?? k) as KeyRecord;
        setSelectedKey(rec);

        // Seed patch fields from current values (fallback to existing)
        setPatchWindowLimit(rec.rl_window_limit ?? patchWindowLimit);
        setPatchWindowSeconds(rec.rl_window_seconds ?? patchWindowSeconds);
        setPatchBucketSeconds(rec.rl_bucket_seconds ?? patchBucketSeconds);
        setPatchDailyLimit(rec.rl_daily_limit ?? patchDailyLimit);
      } catch (e) {
        setSelectedErr(errToString(e));
        setSelectedKey(null);
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token]
  );

  const createKey = useCallback(async () => {
    setBusy(true);
    setCreateErr("");
    try {
      const payload = {
        label: newLabel,
        scopes: scopesArray,
        rl_window_limit: Number(newWindowLimit),
        rl_window_seconds: Number(newWindowSeconds),
        rl_bucket_seconds: Number(newBucketSeconds),
        rl_daily_limit: Number(newDailyLimit),
      };

      await apipFetch("/keys", {
        token,
        method: "POST",
        body: payload,
      });

      alert("API key created.");
      await refreshKeys();
      await refreshMetrics();
    } catch (e) {
      setCreateErr(errToString(e));
    } finally {
      setBusy(false);
    }
  }, [
    token,
    newLabel,
    scopesArray,
    newWindowLimit,
    newWindowSeconds,
    newBucketSeconds,
    newDailyLimit,
    refreshKeys,
    refreshMetrics,
  ]);

  const enableKey = useCallback(
    async (keyId: string) => {
      if (!keyId) return;
      if (!confirm(`Enable key ${keyId}?`)) return;

      setBusy(true);
      setSelectedErr("");
      try {
        await apipFetch(`/keys/${encodeURIComponent(keyId)}/enable`, {
          token,
          method: "POST",
        });

        alert("Key enabled.");
        await fetchOneKey(keyId);
        await refreshKeys();
        await refreshMetrics();
      } catch (e) {
        setSelectedErr(errToString(e));
      } finally {
        setBusy(false);
      }
    },
    [token, fetchOneKey, refreshKeys, refreshMetrics]
  );

  const disableKey = useCallback(
    async (keyId: string) => {
      if (!keyId) return;
      if (!confirm(`Disable key ${keyId}? This will immediately block traffic.`))
        return;

      setBusy(true);
      setSelectedErr("");
      try {
        await apipFetch(`/keys/${encodeURIComponent(keyId)}/disable`, {
          token,
          method: "POST",
        });

        alert("Key disabled.");
        await fetchOneKey(keyId);
        await refreshKeys();
        await refreshMetrics();
      } catch (e) {
        setSelectedErr(errToString(e));
      } finally {
        setBusy(false);
      }
    },
    [token, fetchOneKey, refreshKeys, refreshMetrics]
  );

  const resetCounters = useCallback(
    async (keyId: string) => {
      if (!keyId) return;
      if (!confirm(`Reset counters for key ${keyId}?`)) return;

      setBusy(true);
      setSelectedErr("");
      try {
        await apipFetch(`/keys/${encodeURIComponent(keyId)}/reset-counters`, {
          token,
          method: "POST",
        });

        alert("Counters reset.");
        await fetchOneKey(keyId);
        await refreshKeys();
        await refreshMetrics();
      } catch (e) {
        setSelectedErr(errToString(e));
      } finally {
        setBusy(false);
      }
    },
    [token, fetchOneKey, refreshKeys, refreshMetrics]
  );

  const patchRateLimit = useCallback(
    async (keyId: string) => {
      if (!keyId) return;
      if (
        !confirm(
          `Patch rate limits for key ${keyId}?\n\nWindow limit=${patchWindowLimit}\nWindow seconds=${patchWindowSeconds}\nBucket seconds=${patchBucketSeconds}\nDaily limit=${patchDailyLimit}`
        )
      )
        return;

      setBusy(true);
      setPatchErr("");
      try {
        const payload = {
          rl_window_limit: Number(patchWindowLimit),
          rl_window_seconds: Number(patchWindowSeconds),
          rl_bucket_seconds: Number(patchBucketSeconds),
          rl_daily_limit: Number(patchDailyLimit),
        };

        await apipFetch(`/keys/${encodeURIComponent(keyId)}`, {
          token,
          method: "PATCH",
          body: payload,
        });

        alert("Rate limits updated.");
        await fetchOneKey(keyId);
        await refreshKeys();
        await refreshMetrics();
      } catch (e) {
        setPatchErr(errToString(e));
      } finally {
        setBusy(false);
      }
    },
    [
      token,
      patchWindowLimit,
      patchWindowSeconds,
      patchBucketSeconds,
      patchDailyLimit,
      fetchOneKey,
      refreshKeys,
      refreshMetrics,
    ]
  );

  const onSelectKeyId = useCallback((v: string) => {
    setSelectedKeyId(v);
    setSelectedKey(null);
    setSelectedErr("");
  }, []);

  // ---- UI ----
  return (
    <div style={{ marginTop: 24 }}>
      <h2>Admin Console</h2>

      <div style={{ display: "flex", gap: 10, margin: "10px 0" }}>
        <button disabled={busy} onClick={refreshMetrics}>
          Refresh metrics
        </button>
        <button disabled={busy} onClick={refreshKeys}>
          Refresh keys
        </button>
        {busy ? <span style={{ opacity: 0.8 }}>Working…</span> : null}
      </div>

      {/* Metrics */}
      <div style={{ border: "1px solid #333", padding: 12, borderRadius: 10 }}>
        <h3>Metrics</h3>
        {metricsErr ? (
          <pre style={{ color: "salmon", whiteSpace: "pre-wrap" }}>
            {metricsErr}
          </pre>
        ) : (
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {metrics ? fmtJson(metrics) : "{}"}
          </pre>
        )}
      </div>

      {/* Create key */}
      <div
        style={{
          border: "1px solid #333",
          padding: 12,
          borderRadius: 10,
          marginTop: 16,
        }}
      >
        <h3>Create API Key</h3>
        {createErr ? (
          <pre style={{ color: "salmon", whiteSpace: "pre-wrap" }}>
            {createErr}
          </pre>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Label
            <input
              style={{ width: "100%" }}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              disabled={busy}
            />
          </label>

          <label>
            Scopes (comma-separated)
            <input
              style={{ width: "100%" }}
              value={newScopes}
              onChange={(e) => setNewScopes(e.target.value)}
              disabled={busy}
            />
          </label>

          <label>
            Window limit
            <input
              style={{ width: "100%" }}
              type="number"
              value={newWindowLimit}
              onChange={(e) => setNewWindowLimit(Number(e.target.value))}
              disabled={busy}
            />
          </label>

          <label>
            Window seconds
            <input
              style={{ width: "100%" }}
              type="number"
              value={newWindowSeconds}
              onChange={(e) => setNewWindowSeconds(Number(e.target.value))}
              disabled={busy}
            />
          </label>

          <label>
            Bucket seconds
            <input
              style={{ width: "100%" }}
              type="number"
              value={newBucketSeconds}
              onChange={(e) => setNewBucketSeconds(Number(e.target.value))}
              disabled={busy}
            />
          </label>

          <label>
            Daily limit
            <input
              style={{ width: "100%" }}
              type="number"
              value={newDailyLimit}
              onChange={(e) => setNewDailyLimit(Number(e.target.value))}
              disabled={busy}
            />
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <button disabled={busy} onClick={createKey}>
            Create
          </button>
        </div>
      </div>

      {/* Keys list */}
      <div
        style={{
          border: "1px solid #333",
          padding: 12,
          borderRadius: 10,
          marginTop: 16,
        }}
      >
        <h3>Keys</h3>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label>
            Limit:&nbsp;
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={busy}
              style={{ width: 80 }}
            />
          </label>
          <button disabled={busy} onClick={refreshKeys}>
            Load
          </button>
        </div>

        {keysErr ? (
          <pre style={{ color: "salmon", whiteSpace: "pre-wrap" }}>{keysErr}</pre>
        ) : null}

        <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #333" }}>
              <th style={{ textAlign: "left", padding: 6 }}>key_id</th>
              <th style={{ textAlign: "left", padding: 6 }}>label</th>
              <th style={{ textAlign: "left", padding: 6 }}>active</th>
              <th style={{ textAlign: "left", padding: 6 }}>requests</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td style={{ padding: 6 }} colSpan={4}>
                  (no keys loaded)
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr
                  key={k.key_id}
                  style={{ borderBottom: "1px solid #222", cursor: "pointer" }}
                  onClick={() => {
                    onSelectKeyId(k.key_id);
                    fetchOneKey(k.key_id);
                  }}
                >
                  <td style={{ padding: 6 }}>{k.key_id}</td>
                  <td style={{ padding: 6 }}>{k.label ?? ""}</td>
                  <td style={{ padding: 6 }}>{String(!!k.active)}</td>
                  <td style={{ padding: 6 }}>{k.total_requests ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Selected key */}
      <div
        style={{
          border: "1px solid #333",
          padding: 12,
          borderRadius: 10,
          marginTop: 16,
        }}
      >
        <h3>Selected key</h3>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            style={{ flex: 1 }}
            placeholder="key_id"
            value={selectedKeyId}
            onChange={(e) => onSelectKeyId(e.target.value)}
            disabled={busy}
          />
          <button disabled={busy || !selectedKeyId} onClick={() => fetchOneKey(selectedKeyId)}>
            Fetch
          </button>
          <button disabled={busy || !selectedKeyId} onClick={() => enableKey(selectedKeyId)}>
            Enable
          </button>
          <button disabled={busy || !selectedKeyId} onClick={() => disableKey(selectedKeyId)}>
            Disable
          </button>
          <button disabled={busy || !selectedKeyId} onClick={() => resetCounters(selectedKeyId)}>
            Reset counters
          </button>
        </div>

        {selectedErr ? (
          <pre style={{ color: "salmon", whiteSpace: "pre-wrap" }}>
            {selectedErr}
          </pre>
        ) : null}

        {selectedKey ? (
          <pre style={{ whiteSpace: "pre-wrap" }}>{fmtJson(selectedKey)}</pre>
        ) : null}

        <h4 style={{ marginTop: 14 }}>Patch rate limit</h4>

        {patchErr ? (
          <pre style={{ color: "salmon", whiteSpace: "pre-wrap" }}>{patchErr}</pre>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Window limit
            <input
              style={{ width: "100%" }}
              type="number"
              value={patchWindowLimit}
              onChange={(e) => setPatchWindowLimit(Number(e.target.value))}
              disabled={busy}
            />
          </label>

          <label>
            Window seconds
            <input
              style={{ width: "100%" }}
              type="number"
              value={patchWindowSeconds}
              onChange={(e) => setPatchWindowSeconds(Number(e.target.value))}
              disabled={busy}
            />
          </label>

          <label>
            Bucket seconds
            <input
              style={{ width: "100%" }}
              type="number"
              value={patchBucketSeconds}
              onChange={(e) => setPatchBucketSeconds(Number(e.target.value))}
              disabled={busy}
            />
          </label>

          <label>
            Daily limit
            <input
              style={{ width: "100%" }}
              type="number"
              value={patchDailyLimit}
              onChange={(e) => setPatchDailyLimit(Number(e.target.value))}
              disabled={busy}
            />
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <button
            disabled={busy || !selectedKeyId}
            onClick={() => patchRateLimit(selectedKeyId)}
          >
            Patch
          </button>
        </div>
      </div>
    </div>
  );
}