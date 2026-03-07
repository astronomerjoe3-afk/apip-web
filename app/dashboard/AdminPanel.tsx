"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apipFetch, ApiError } from "@/lib/apip";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

type RateLimitSummary = {
  top_n?: number;
  global_last_hour?: { total?: number };
  global_last_24h?: { total?: number };
  top_keys_last_hour?: Array<Record<string, unknown>>;
  top_keys_last_24h?: Array<Record<string, unknown>>;
};

type PostureSummary = Record<string, unknown>;

type Metrics = {
  ok?: boolean;
  utc?: string;
  keys?: {
    total?: number;
    active?: number;
    auto_disabled?: number;
  };
  rate_limit?: RateLimitSummary;
  posture?: PostureSummary;
  warnings?: string[];
};

type KeyRecord = {
  key_id: string;
  label?: string;
  scopes?: string[];
  active?: boolean;
  created_utc?: string;
  updated_utc?: string;
  created_at_utc?: string;
  last_used_utc?: string;
  last_used_at_utc?: string;
  rate_limit?: {
    window_limit?: number;
    window_seconds?: number;
    bucket_seconds?: number;
  };
  daily_limit?: number;
  rl_window_limit?: number;
  rl_window_seconds?: number;
  rl_bucket_seconds?: number;
  rl_daily_limit?: number;
  total_requests?: number;
  auto_disabled?: boolean;
};

type KeysListResponse = {
  ok?: boolean;
  keys?: KeyRecord[];
  count?: number;
  limit?: number;
  utc?: string;
};

type CreateKeyRequest = {
  label: string;
  scopes: string[];
  daily_limit: number;
  window_limit: number;
  window_seconds: number;
  bucket_seconds: number;
};

type CreateKeyResponse = {
  ok?: boolean;
  key_id?: string;
  api_key?: string;
  active?: boolean;
  label?: string;
  scopes?: string[];
  utc?: string;
  key?: KeyRecord;
};

function fmtJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function errToString(error: unknown): string {
  if (error instanceof ApiError) {
    const detailText = error.detail ? `\n${fmtJson(error.detail)}` : "";
    return `HTTP ${error.status}: ${error.message}${detailText}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
}

function normalizeNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function AdminPanel() {
  const base = useMemo(() => apiBase(), []);
  const [token, setToken] = useState<string>("");

  const [meEmail, setMeEmail] = useState<string>("");
  const [authErr, setAuthErr] = useState<string>("");

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsErr, setMetricsErr] = useState<string>("");

  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysErr, setKeysErr] = useState<string>("");
  const [keysLoading, setKeysLoading] = useState<boolean>(false);

  const [create, setCreate] = useState<CreateKeyRequest>({
    label: "new-key",
    scopes: ["profile:read"],
    daily_limit: 500,
    window_limit: 10,
    window_seconds: 60,
    bucket_seconds: 10,
  });
  const [createErr, setCreateErr] = useState<string>("");
  const [createdApiKey, setCreatedApiKey] = useState<string>("");
  const [createdKeyId, setCreatedKeyId] = useState<string>("");

  const [selectedKeyId, setSelectedKeyId] = useState<string>("");

  const selectedKey = useMemo<KeyRecord | null>(
    () => keys.find((key) => key.key_id === selectedKeyId) || null,
    [keys, selectedKeyId],
  );

  async function refreshToken(): Promise<void> {
    setAuthErr("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setToken("");
        setMeEmail("");
        setAuthErr("Not logged in. Please login first.");
        return;
      }

      setMeEmail(user.email || "");
      const freshToken = await user.getIdToken(true);
      setToken(freshToken);
    } catch (error: unknown) {
      setAuthErr(errToString(error));
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      void refreshToken();
    });

    void refreshToken();

    return () => unsubscribe();
  }, []);

  async function loadMetrics(): Promise<void> {
    setMetricsErr("");
    try {
      const response = await apipFetch<Metrics>("/admin/metrics", {
        token,
        query: { top_n: 10 },
      });
      setMetrics(response);
    } catch (error: unknown) {
      setMetricsErr(errToString(error));
      setMetrics(null);
    }
  }

  async function loadKeys(): Promise<void> {
    setKeysErr("");
    setKeysLoading(true);

    try {
      const response = await apipFetch<KeysListResponse>("/admin/keys", {
        token,
        query: { limit: 50 },
      });

      const list = Array.isArray(response.keys) ? response.keys : [];
      setKeys(list);

      if (list.length > 0 && !selectedKeyId) {
        setSelectedKeyId(list[0].key_id);
      }
    } catch (error: unknown) {
      setKeysErr(errToString(error));
      setKeys([]);
    } finally {
      setKeysLoading(false);
    }
  }

  async function createKey(): Promise<void> {
    setCreateErr("");
    setCreatedApiKey("");
    setCreatedKeyId("");

    try {
      const response = await apipFetch<CreateKeyResponse>("/admin/keys", {
        token,
        method: "POST",
        body: {
          label: create.label,
          scopes: create.scopes,
          daily_limit: create.daily_limit,
          window_limit: create.window_limit,
          window_seconds: create.window_seconds,
          bucket_seconds: create.bucket_seconds,
        },
      });

      const keyId = response.key_id || response.key?.key_id || "";
      const apiKey = response.api_key || "";

      setCreatedKeyId(keyId);
      setCreatedApiKey(apiKey);

      await loadKeys();

      if (keyId) {
        setSelectedKeyId(keyId);
      }
    } catch (error: unknown) {
      setCreateErr(errToString(error));
    }
  }

  async function enableKey(keyId: string): Promise<void> {
    try {
      await apipFetch(`/admin/keys/${encodeURIComponent(keyId)}/enable`, {
        token,
        method: "POST",
      });
      await loadKeys();
    } catch (error: unknown) {
      alert(errToString(error));
    }
  }

  async function resetCounters(keyId: string): Promise<void> {
    try {
      await apipFetch(`/admin/keys/${encodeURIComponent(keyId)}/reset-counters`, {
        token,
        method: "POST",
      });
      await loadKeys();
    } catch (error: unknown) {
      alert(errToString(error));
    }
  }

  async function copyAdminToken(): Promise<void> {
    setAuthErr("");

    try {
      if (!token) {
        await refreshToken();
      }

      const user = auth.currentUser;
      if (!user) {
        setAuthErr("Not logged in.");
        return;
      }

      const freshToken = token || (await user.getIdToken(true));
      await copyToClipboard(freshToken);
      alert("Admin ID token copied to clipboard.");
    } catch (error: unknown) {
      setAuthErr(errToString(error));
    }
  }

  async function doLogout(): Promise<void> {
    try {
      await signOut(auth);
      setToken("");
      setMeEmail("");
      setMetrics(null);
      setKeys([]);
      setSelectedKeyId("");
      alert("Logged out.");
    } catch (error: unknown) {
      alert(errToString(error));
    }
  }

  useEffect(() => {
    if (!token) return;
    void loadMetrics();
    void loadKeys();
  }, [token]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Admin Dashboard</h2>

      <div
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div>
              <strong>API Base:</strong> {base || "(missing NEXT_PUBLIC_API_BASE_URL)"}
            </div>
            <div>
              <strong>Signed in as:</strong> {meEmail || "(none)"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => void refreshToken()} disabled={!auth.currentUser}>
              Refresh token
            </button>
            <button onClick={() => void copyAdminToken()} disabled={!auth.currentUser}>
              Copy admin ID token
            </button>
            <button onClick={() => void doLogout()} disabled={!auth.currentUser}>
              Logout
            </button>
          </div>
        </div>

        {authErr ? (
          <pre style={{ color: "crimson", marginTop: 10, whiteSpace: "pre-wrap" }}>
            {authErr}
          </pre>
        ) : null}

        <div style={{ marginTop: 10, fontSize: 13, color: "#555" }}>
          Notes:
          <ul style={{ marginTop: 6 }}>
            <li>
              We do <strong>not</strong> display your token by default
              (security). Use &ldquo;Copy admin ID token&rdquo;.
            </li>
            <li>
              API keys are only shown <strong>once</strong> immediately after
              creation.
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ margin: 0 }}>Metrics</h3>
          <button onClick={() => void loadMetrics()} disabled={!token}>
            Reload metrics
          </button>
        </div>

        {metricsErr ? (
          <pre style={{ color: "crimson", marginTop: 10, whiteSpace: "pre-wrap" }}>
            {metricsErr}
          </pre>
        ) : null}

        <pre
          style={{
            marginTop: 10,
            background: "#fafafa",
            padding: 10,
            borderRadius: 6,
            overflowX: "auto",
          }}
        >
          {metrics ? fmtJson(metrics) : "(no metrics yet)"}
        </pre>
      </div>

      <div
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Create API Key</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            Label
            <input
              style={{ width: "100%" }}
              value={create.label}
              onChange={(event) =>
                setCreate((prev) => ({ ...prev, label: event.target.value }))
              }
            />
          </label>

          <label>
            Scopes (comma-separated)
            <input
              style={{ width: "100%" }}
              value={create.scopes.join(",")}
              onChange={(event) =>
                setCreate((prev) => ({
                  ...prev,
                  scopes: event.target.value
                    .split(",")
                    .map((scope) => scope.trim())
                    .filter(Boolean),
                }))
              }
            />
          </label>

          <label>
            Window limit
            <input
              style={{ width: "100%" }}
              type="number"
              value={create.window_limit}
              onChange={(event) =>
                setCreate((prev) => ({
                  ...prev,
                  window_limit: normalizeNumber(event.target.value, prev.window_limit),
                }))
              }
            />
          </label>

          <label>
            Window seconds
            <input
              style={{ width: "100%" }}
              type="number"
              value={create.window_seconds}
              onChange={(event) =>
                setCreate((prev) => ({
                  ...prev,
                  window_seconds: normalizeNumber(
                    event.target.value,
                    prev.window_seconds,
                  ),
                }))
              }
            />
          </label>

          <label>
            Bucket seconds
            <input
              style={{ width: "100%" }}
              type="number"
              value={create.bucket_seconds}
              onChange={(event) =>
                setCreate((prev) => ({
                  ...prev,
                  bucket_seconds: normalizeNumber(
                    event.target.value,
                    prev.bucket_seconds,
                  ),
                }))
              }
            />
          </label>

          <label>
            Daily limit
            <input
              style={{ width: "100%" }}
              type="number"
              value={create.daily_limit}
              onChange={(event) =>
                setCreate((prev) => ({
                  ...prev,
                  daily_limit: normalizeNumber(event.target.value, prev.daily_limit),
                }))
              }
            />
          </label>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button onClick={() => void createKey()} disabled={!token}>
            Create key
          </button>
          <button onClick={() => void loadKeys()} disabled={!token}>
            Reload keys
          </button>
        </div>

        {createErr ? (
          <pre style={{ color: "crimson", marginTop: 10, whiteSpace: "pre-wrap" }}>
            {createErr}
          </pre>
        ) : null}

        {createdApiKey ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid #f0c36d",
              borderRadius: 8,
              background: "#fff8e6",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <strong>ONE-TIME API KEY</strong>
                <div style={{ fontSize: 13, color: "#555" }}>
                  Copy now — it will not be shown again. Key ID:{" "}
                  <code>{createdKeyId || "(unknown)"}</code>
                </div>
              </div>
              <button onClick={() => void copyToClipboard(createdApiKey)}>
                Copy API key
              </button>
            </div>

            <pre
              style={{
                marginTop: 10,
                background: "#fff",
                padding: 10,
                borderRadius: 6,
                overflowX: "auto",
              }}
            >
              {createdApiKey}
            </pre>
          </div>
        ) : null}
      </div>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ margin: 0 }}>Keys</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {keysLoading ? <span style={{ fontSize: 13 }}>Loading...</span> : null}
            <button onClick={() => void loadKeys()} disabled={!token}>
              Reload
            </button>
          </div>
        </div>

        {keysErr ? (
          <pre style={{ color: "crimson", marginTop: 10, whiteSpace: "pre-wrap" }}>
            {keysErr}
          </pre>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: 12,
            marginTop: 10,
          }}
        >
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8 }}>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
              Select a key
            </div>

            <select
              style={{ width: "100%", padding: 8 }}
              value={selectedKeyId}
              onChange={(event) => setSelectedKeyId(event.target.value)}
            >
              <option value="" disabled>
                (choose)
              </option>
              {keys.map((key) => (
                <option key={key.key_id} value={key.key_id}>
                  {key.key_id} — {key.label || "(no label)"}{" "}
                  {key.active ? "" : "[disabled]"}
                </option>
              ))}
            </select>

            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => void (selectedKeyId ? enableKey(selectedKeyId) : Promise.resolve())}
                disabled={!token || !selectedKeyId}
              >
                Enable key
              </button>

              <button
                onClick={() =>
                  void (selectedKeyId ? resetCounters(selectedKeyId) : Promise.resolve())
                }
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

            <pre
              style={{
                background: "#fafafa",
                padding: 10,
                borderRadius: 6,
                overflowX: "auto",
              }}
            >
              {selectedKey ? fmtJson(selectedKey) : "(none selected)"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}