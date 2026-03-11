"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";

import { ApiError, apipBase, apipFetch } from "@/lib/apip";
import { auth } from "@/lib/firebase";

type FlashTone = "success" | "warning" | "error" | "info";

type FlashMessage = {
  tone: FlashTone;
  message: string;
};

type LegacyMetrics = {
  api_keys?: { total?: number; enabled?: number; disabled?: number };
  traffic?: { total_requests?: number; blocked_requests?: number };
  build?: { environment?: string; google_cloud_project?: string };
};

type ModernMetrics = {
  ok?: boolean;
  utc?: string;
  keys?: { total?: number; active?: number; auto_disabled?: number };
  rate_limit?: unknown;
  warnings?: string[];
};

type MetricsResponse = LegacyMetrics & ModernMetrics;

type LegacyKeyRecord = {
  key_id: string;
  name?: string;
  status?: string;
  scopes?: string[];
  created_at_utc?: string;
  last_used_at_utc?: string | null;
  counters?: { total_requests?: number; blocked_requests?: number };
  rate_limit_per_minute?: number;
};

type ModernKeyRecord = {
  key_id: string;
  label?: string;
  active?: boolean;
  scopes?: string[];
  created_utc?: string;
  updated_utc?: string;
  last_used_utc?: string | null;
  rate_limit?: {
    window_limit?: number;
    window_seconds?: number;
    bucket_seconds?: number;
  };
  daily_limit?: number;
  auto_disabled?: boolean;
};

type KeyRecordInput = Partial<LegacyKeyRecord & ModernKeyRecord> & Record<string, unknown>;

type KeysListResponse =
  | {
      ok?: boolean;
      keys?: KeyRecordInput[];
      count?: number;
      limit?: number;
      utc?: string;
    }
  | KeyRecordInput[];

type CreateKeyRequest = {
  label: string;
  scopes: string[];
  window_limit: number;
  window_seconds: number;
  bucket_seconds: number;
  daily_limit: number;
};

type CreateKeyResponse = {
  ok?: boolean;
  key_id?: string;
  api_key?: string;
  key?: KeyRecordInput;
  doc?: KeyRecordInput;
  label?: string;
  scopes?: string[];
};

type KeyRecord = {
  key_id: string;
  label: string;
  active: boolean;
  auto_disabled: boolean;
  scopes: string[];
  created_utc: string;
  updated_utc: string;
  last_used_utc: string;
  daily_limit: number | null;
  window_limit: number | null;
  window_seconds: number | null;
  bucket_seconds: number | null;
  rate_limit_per_minute: number | null;
  total_requests: number | null;
  blocked_requests: number | null;
  raw: unknown;
};

type MetricsSnapshot = {
  totalKeys: number;
  activeKeys: number;
  disabledKeys: number;
  autoDisabledKeys: number;
  totalRequests: number;
  blockedRequests: number;
  warnings: string[];
  utc: string;
  environment: string;
  project: string;
  raw: unknown;
};

type PlaybookStep = {
  title: string;
  body: string;
  checklist: string[];
};

type CommandCard = {
  title: string;
  description: string;
  command: string;
};

const PLAYBOOK_STEPS: PlaybookStep[] = [
  {
    title: "Start each admin session carefully",
    body: "Confirm you are on the right account, refresh live data, and look for warnings before changing anything.",
    checklist: [
      "Check the signed-in email and role badge.",
      "Reload metrics to see active, disabled, and auto-disabled keys.",
      "If anything looks odd, disable risky keys before doing deeper work.",
    ],
  },
  {
    title: "Create the smallest safe key",
    body: "Every new key should be traceable to one owner and one use case.",
    checklist: [
      "Use a descriptive label such as 'teacher-portal-sync' or 'mobile-beta-readonly'.",
      "Keep scopes narrow and rate limits realistic.",
      "Copy the one-time key immediately into a secure vault because it will not appear again.",
    ],
  },
  {
    title: "Respond to suspicious activity fast",
    body: "When a key is exposed or behaving badly, containment is more important than diagnosis.",
    checklist: [
      "Search the key by label or key ID.",
      "Disable it first if it is risky or no longer trusted.",
      "Reset counters after the incident is understood and documented.",
    ],
  },
  {
    title: "Know what belongs outside the dashboard",
    body: "The dashboard handles live operations. Protected identity and content changes still belong in secure scripts.",
    checklist: [
      "Create or promote users with backend admin scripts.",
      "Seed or reseed module content from the API workspace.",
      "Treat the dashboard as your control room, not your migration tool.",
    ],
  },
];

const ADVANCED_TASKS: CommandCard[] = [
  {
    title: "Create a student, instructor, or admin account",
    description: "Run this in the API repo when onboarding a new user and optionally provision the Firestore user document.",
    command:
      "python scripts/create_user.py --email teacher@example.com --password temp-pass --role instructor --provision-user-doc",
  },
  {
    title: "Promote or change a user's role",
    description: "Use this when an existing account needs a new role claim, such as instructor or admin.",
    command:
      "python scripts/set_role.py --email teacher@example.com --role admin --provision-user-doc",
  },
  {
    title: "Seed the F1 module content",
    description: "Use this when you need to refresh the Physical Quantities and Measurement module content in Firestore.",
    command: "python scripts/seed_f1_module.py --apply",
  },
];

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function fmtJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function errToString(error: unknown): string {
  if (error instanceof ApiError) {
    const detailText = error.detail ? "\n" + fmtJson(error.detail) : "";
    return "HTTP " + error.status + ": " + error.message + detailText;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

function noticeClassName(tone: FlashTone): string {
  switch (tone) {
    case "success":
      return "admin-notice admin-notice-success";
    case "warning":
      return "admin-notice admin-notice-warning";
    case "error":
      return "admin-notice admin-notice-error";
    default:
      return "admin-notice admin-notice-info";
  }
}

function keyBadgeClassName(key: KeyRecord): string {
  if (key.auto_disabled) {
    return "admin-badge admin-badge-warning";
  }

  return key.active ? "admin-badge admin-badge-success" : "admin-badge admin-badge-muted";
}

function keyStatusLabel(key: KeyRecord): string {
  if (key.auto_disabled) {
    return "auto-disabled";
  }

  return key.active ? "active" : "disabled";
}

function normalizeKey(record: KeyRecordInput): KeyRecord {
  const rateLimit = typeof record.rate_limit === "object" && record.rate_limit !== null ? record.rate_limit : {};
  const counters = typeof record.counters === "object" && record.counters !== null ? record.counters : {};

  return {
    key_id: String(record.key_id || ""),
    label: String(record.label || record.name || "Untitled key"),
    active:
      typeof record.active === "boolean"
        ? record.active
        : String(record.status || "disabled").toLowerCase() === "enabled",
    auto_disabled: Boolean(record.auto_disabled),
    scopes: Array.isArray(record.scopes) ? record.scopes.map((scope) => String(scope)) : [],
    created_utc: String(record.created_utc || record.created_at_utc || "Not recorded"),
    updated_utc: String(record.updated_utc || "Not recorded"),
    last_used_utc: String(record.last_used_utc || record.last_used_at_utc || "Never used"),
    daily_limit: numberOrNull(record.daily_limit || record.rl_daily_limit),
    window_limit: numberOrNull((rateLimit as Record<string, unknown>).window_limit || record.rl_window_limit),
    window_seconds: numberOrNull((rateLimit as Record<string, unknown>).window_seconds || record.rl_window_seconds),
    bucket_seconds: numberOrNull((rateLimit as Record<string, unknown>).bucket_seconds || record.rl_bucket_seconds),
    rate_limit_per_minute: numberOrNull(record.rate_limit_per_minute),
    total_requests: numberOrNull((counters as Record<string, unknown>).total_requests || record.total_requests),
    blocked_requests: numberOrNull((counters as Record<string, unknown>).blocked_requests || record.blocked_requests),
    raw: record,
  };
}

function normalizeKeysResponse(payload: KeysListResponse): KeyRecord[] {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.keys)
      ? payload.keys
      : [];

  return list
    .map((record) => normalizeKey(record))
    .filter((record) => record.key_id);
}

function normalizeMetrics(payload: MetricsResponse | null): MetricsSnapshot {
  const totalKeys = numberOrNull(payload?.keys?.total) ?? numberOrNull(payload?.api_keys?.total) ?? 0;
  const activeKeys = numberOrNull(payload?.keys?.active) ?? numberOrNull(payload?.api_keys?.enabled) ?? 0;
  const disabledKeys = numberOrNull(payload?.api_keys?.disabled) ?? Math.max(totalKeys - activeKeys, 0);
  const autoDisabledKeys = numberOrNull(payload?.keys?.auto_disabled) ?? 0;
  const totalRequests = numberOrNull(payload?.traffic?.total_requests) ?? 0;
  const blockedRequests = numberOrNull(payload?.traffic?.blocked_requests) ?? 0;

  return {
    totalKeys,
    activeKeys,
    disabledKeys,
    autoDisabledKeys,
    totalRequests,
    blockedRequests,
    warnings: Array.isArray(payload?.warnings) ? payload.warnings.map((item) => String(item)) : [],
    utc: String(payload?.utc || "Not refreshed yet"),
    environment: String(payload?.build?.environment || "Not exposed"),
    project: String(payload?.build?.google_cloud_project || "Not exposed"),
    raw: payload,
  };
}

function normalizeCreateResponse(payload: CreateKeyResponse): { keyId: string; apiKey: string } {
  const nestedRecord = payload.key || payload.doc;
  return {
    keyId: String(payload.key_id || nestedRecord?.key_id || ""),
    apiKey: String(payload.api_key || ""),
  };
}

export default function AdminPanel() {
  const base = useMemo(() => apipBase(), []);
  const [token, setToken] = useState<string>("");
  const [meEmail, setMeEmail] = useState<string>("");
  const [authErr, setAuthErr] = useState<string>("");
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [metricsErr, setMetricsErr] = useState<string>("");
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);

  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [keysErr, setKeysErr] = useState<string>("");
  const [keysLoading, setKeysLoading] = useState<boolean>(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [keyFilter, setKeyFilter] = useState<string>("");
  const [keyActionBusy, setKeyActionBusy] = useState<string>("");

  const [create, setCreate] = useState<CreateKeyRequest>({
    label: "teacher-portal-readonly",
    scopes: ["profile:read"],
    window_limit: 10,
    window_seconds: 60,
    bucket_seconds: 10,
    daily_limit: 500,
  });
  const [createBusy, setCreateBusy] = useState<boolean>(false);
  const [createErr, setCreateErr] = useState<string>("");
  const [createdApiKey, setCreatedApiKey] = useState<string>("");
  const [createdKeyId, setCreatedKeyId] = useState<string>("");

  const selectedKey = useMemo(
    () => keys.find((keyItem) => keyItem.key_id === selectedKeyId) || null,
    [keys, selectedKeyId],
  );

  const filteredKeys = useMemo(() => {
    const query = keyFilter.trim().toLowerCase();
    if (!query) {
      return keys;
    }

    return keys.filter((keyItem) => {
      const haystack = [keyItem.key_id, keyItem.label, keyItem.scopes.join(" ")].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [keyFilter, keys]);

  const metricsSnapshot = useMemo(() => normalizeMetrics(metrics), [metrics]);

  const refreshToken = useCallback(async (): Promise<void> => {
    setAuthErr("");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setToken("");
        setMeEmail("");
        setAuthErr("Not logged in. Sign in again to manage the site.");
        return;
      }

      setMeEmail(currentUser.email || "");
      const nextToken = await currentUser.getIdToken(true);
      setToken(nextToken);
    } catch (error: unknown) {
      setAuthErr(errToString(error));
    }
  }, []);

  const loadMetrics = useCallback(async (): Promise<void> => {
    if (!token) {
      return;
    }

    setMetricsLoading(true);
    setMetricsErr("");

    try {
      const payload = await apipFetch<MetricsResponse>("/admin/metrics", {
        token,
        query: { top_n: 10 },
      });
      setMetrics(payload);
    } catch (error: unknown) {
      setMetricsErr(errToString(error));
      setMetrics(null);
    } finally {
      setMetricsLoading(false);
    }
  }, [token]);

  const loadKeys = useCallback(async (): Promise<void> => {
    if (!token) {
      return;
    }

    setKeysLoading(true);
    setKeysErr("");

    try {
      const payload = await apipFetch<KeysListResponse>("/admin/keys", {
        token,
        query: { limit: 50 },
      });

      const normalized = normalizeKeysResponse(payload);
      setKeys(normalized);
      setSelectedKeyId((current) => {
        if (normalized.some((keyItem) => keyItem.key_id === current)) {
          return current;
        }
        return normalized[0]?.key_id || "";
      });
    } catch (error: unknown) {
      setKeysErr(errToString(error));
      setKeys([]);
      setSelectedKeyId("");
    } finally {
      setKeysLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      void refreshToken();
    });

    void refreshToken();
    return () => unsubscribe();
  }, [refreshToken]);

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadMetrics();
    void loadKeys();
  }, [loadKeys, loadMetrics, token]);

  const createKey = useCallback(async (): Promise<void> => {
    if (!token) {
      return;
    }

    setCreateBusy(true);
    setCreateErr("");
    setCreatedApiKey("");
    setCreatedKeyId("");
    setFlash(null);

    try {
      const payload = await apipFetch<CreateKeyResponse>("/admin/keys", {
        token,
        method: "POST",
        body: create,
      });

      const normalizedCreate = normalizeCreateResponse(payload);
      setCreatedKeyId(normalizedCreate.keyId);
      setCreatedApiKey(normalizedCreate.apiKey);
      setFlash({
        tone: "success",
        message: normalizedCreate.keyId
          ? "Key " + normalizedCreate.keyId + " was created. Copy the secret now and store it in your vault."
          : "A new key was created. Copy the secret now and store it safely.",
      });

      await Promise.all([loadKeys(), loadMetrics()]);

      if (normalizedCreate.keyId) {
        setSelectedKeyId(normalizedCreate.keyId);
      }
    } catch (error: unknown) {
      setCreateErr(errToString(error));
    } finally {
      setCreateBusy(false);
    }
  }, [create, loadKeys, loadMetrics, token]);

  const runKeyAction = useCallback(
    async (keyId: string, action: "enable" | "disable" | "reset-counters"): Promise<void> => {
      if (!token || !keyId) {
        return;
      }

      setKeyActionBusy(keyId + ":" + action);
      setFlash(null);

      try {
        await apipFetch("/admin/keys/" + encodeURIComponent(keyId) + "/" + action, {
          token,
          method: "POST",
        });

        const actionMessage =
          action === "enable"
            ? "Key " + keyId + " is enabled again."
            : action === "disable"
              ? "Key " + keyId + " has been disabled."
              : "Counters for " + keyId + " were reset.";

        setFlash({
          tone: action === "disable" ? "warning" : "success",
          message: actionMessage,
        });

        await Promise.all([loadKeys(), loadMetrics()]);
      } catch (error: unknown) {
        setFlash({ tone: "error", message: errToString(error) });
      } finally {
        setKeyActionBusy("");
      }
    },
    [loadKeys, loadMetrics, token],
  );

  const copyAdminToken = useCallback(async (): Promise<void> => {
    setAuthErr("");
    setFlash(null);

    try {
      if (!token) {
        await refreshToken();
      }

      if (!auth.currentUser) {
        setAuthErr("Not logged in.");
        return;
      }

      const resolvedToken = token || (await auth.currentUser.getIdToken(true));
      await copyToClipboard(resolvedToken);
      setFlash({ tone: "info", message: "Fresh admin ID token copied to your clipboard." });
    } catch (error: unknown) {
      setAuthErr(errToString(error));
    }
  }, [refreshToken, token]);

  const doLogout = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
      setToken("");
      setMeEmail("");
      setMetrics(null);
      setKeys([]);
      setSelectedKeyId("");
      window.location.href = "/login";
    } catch (error: unknown) {
      setFlash({ tone: "error", message: errToString(error) });
    }
  }, []);

  return (
    <div className="admin-layout">
      <div className="admin-stack">
        <section className="admin-card admin-card-hero">
          <div className="admin-section-header">
            <div>
              <p className="admin-kicker">Operations workspace</p>
              <h2 className="admin-section-title">Run Cognispark from one calm control room</h2>
              <p className="admin-section-copy">
                Monitor platform posture, manage API keys, and follow the playbook while you work so admin tasks stay safe and repeatable.
              </p>
            </div>
            <div className="admin-toolbar">
              <button className="admin-btn admin-btn-secondary" onClick={() => void refreshToken()} disabled={!auth.currentUser}>
                Refresh session
              </button>
              <a className="admin-btn admin-btn-secondary" href="/operations-guide#admin-dashboard">
                Operations guide
              </a>
              <button className="admin-btn admin-btn-primary" onClick={() => void copyAdminToken()} disabled={!auth.currentUser}>
                Copy admin token
              </button>
              <button className="admin-btn admin-btn-danger" onClick={() => void doLogout()} disabled={!auth.currentUser}>
                Logout
              </button>
            </div>
          </div>
        </section>

        {flash ? <div className={noticeClassName(flash.tone)}>{flash.message}</div> : null}
        {authErr ? <div className="admin-notice admin-notice-error">{authErr}</div> : null}
        {metricsErr ? <div className="admin-notice admin-notice-error">{metricsErr}</div> : null}
        {keysErr ? <div className="admin-notice admin-notice-error">{keysErr}</div> : null}

        <section className="admin-stat-grid">
          <article className="admin-stat-card">
            <p className="admin-stat-label">Total keys</p>
            <p className="admin-stat-value">{metricsSnapshot.totalKeys}</p>
            <p className="admin-stat-caption">Every integration credential currently stored.</p>
          </article>
          <article className="admin-stat-card">
            <p className="admin-stat-label">Active keys</p>
            <p className="admin-stat-value">{metricsSnapshot.activeKeys}</p>
            <p className="admin-stat-caption">Keys that can still authenticate right now.</p>
          </article>
          <article className="admin-stat-card">
            <p className="admin-stat-label">Auto-disabled</p>
            <p className="admin-stat-value">{metricsSnapshot.autoDisabledKeys}</p>
            <p className="admin-stat-caption">Keys disabled automatically by protection rules.</p>
          </article>
          <article className="admin-stat-card">
            <p className="admin-stat-label">Blocked requests</p>
            <p className="admin-stat-value">{metricsSnapshot.blockedRequests}</p>
            <p className="admin-stat-caption">Rate-limited or rejected calls captured in traffic counters.</p>
          </article>
        </section>

        <section className="admin-card">
          <div className="admin-section-header admin-section-header-compact">
            <div>
              <p className="admin-kicker">System health</p>
              <h3 className="admin-section-subtitle">Read the room before you act</h3>
              <p className="admin-section-copy">
                Use this summary to check whether the platform is healthy or whether key cleanup needs attention first.
              </p>
            </div>
            <button className="admin-btn admin-btn-secondary" onClick={() => void loadMetrics()} disabled={!token || metricsLoading}>
              {metricsLoading ? "Refreshing..." : "Reload metrics"}
            </button>
          </div>

          <div className="admin-health-grid">
            <div className="admin-subpanel">
              <p className="admin-mini-label">Current posture</p>
              {metricsSnapshot.warnings.length ? (
                <div className="admin-notice admin-notice-warning">
                  <strong>Attention needed.</strong> Review the warnings before issuing new credentials.
                </div>
              ) : (
                <div className="admin-notice admin-notice-success">
                  No warnings are currently reported. You still should refresh metrics before major changes.
                </div>
              )}

              <ul className="admin-bullet-list">
                <li>Environment: {metricsSnapshot.environment}</li>
                <li>Project: {metricsSnapshot.project}</li>
                <li>Last refresh: {metricsSnapshot.utc}</li>
                <li>Disabled keys: {metricsSnapshot.disabledKeys}</li>
                <li>Total requests tracked: {metricsSnapshot.totalRequests}</li>
              </ul>
            </div>

            <div className="admin-subpanel">
              <p className="admin-mini-label">Warnings</p>
              {metricsSnapshot.warnings.length ? (
                <ul className="admin-bullet-list">
                  {metricsSnapshot.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p className="admin-muted-copy">No warnings were returned by the API on the last refresh.</p>
              )}
            </div>
          </div>

          <details className="admin-raw-toggle">
            <summary>Open raw metrics JSON</summary>
            <pre className="admin-code">{metrics ? fmtJson(metricsSnapshot.raw) : "(no metrics yet)"}</pre>
          </details>
        </section>

        <section className="admin-card">
          <div className="admin-section-header admin-section-header-compact">
            <div>
              <p className="admin-kicker">Key creation</p>
              <h3 className="admin-section-subtitle">Create a narrowly scoped API key</h3>
              <p className="admin-section-copy">
                Keep labels descriptive, keep scopes small, and keep limits realistic for the integration you are enabling.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Label</span>
              <input
                value={create.label}
                onChange={(event) =>
                  setCreate((prev) => ({
                    ...prev,
                    label: event.target.value,
                  }))
                }
              />
            </label>

            <label className="admin-field">
              <span>Scopes (comma-separated)</span>
              <input
                value={create.scopes.join(", ")}
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

            <label className="admin-field">
              <span>Window limit</span>
              <input
                type="number"
                value={create.window_limit}
                onChange={(event) =>
                  setCreate((prev) => ({
                    ...prev,
                    window_limit: Number(event.target.value),
                  }))
                }
              />
            </label>

            <label className="admin-field">
              <span>Window seconds</span>
              <input
                type="number"
                value={create.window_seconds}
                onChange={(event) =>
                  setCreate((prev) => ({
                    ...prev,
                    window_seconds: Number(event.target.value),
                  }))
                }
              />
            </label>

            <label className="admin-field">
              <span>Bucket seconds</span>
              <input
                type="number"
                value={create.bucket_seconds}
                onChange={(event) =>
                  setCreate((prev) => ({
                    ...prev,
                    bucket_seconds: Number(event.target.value),
                  }))
                }
              />
            </label>

            <label className="admin-field">
              <span>Daily limit</span>
              <input
                type="number"
                value={create.daily_limit}
                onChange={(event) =>
                  setCreate((prev) => ({
                    ...prev,
                    daily_limit: Number(event.target.value),
                  }))
                }
              />
            </label>
          </div>

          <div className="admin-inline-hints">
            <div className="admin-chip">Use owner plus purpose in the label.</div>
            <div className="admin-chip">Only add scopes the integration truly needs.</div>
            <div className="admin-chip">Tight rate limits are safer than generous ones.</div>
          </div>

          <div className="admin-toolbar admin-toolbar-tight">
            <button className="admin-btn admin-btn-primary" onClick={() => void createKey()} disabled={!token || createBusy}>
              {createBusy ? "Creating..." : "Create key"}
            </button>
            <button className="admin-btn admin-btn-secondary" onClick={() => void loadKeys()} disabled={!token || keysLoading}>
              Reload key inventory
            </button>
          </div>

          {createErr ? <div className="admin-notice admin-notice-error">{createErr}</div> : null}

          {createdApiKey ? (
            <div className="admin-notice admin-notice-warning">
              <div className="admin-section-header admin-section-header-compact">
                <div>
                  <strong>One-time secret for {createdKeyId || "new key"}</strong>
                  <p className="admin-muted-copy">
                    Copy this secret now. The dashboard will not be able to reveal it again later.
                  </p>
                </div>
                <button className="admin-btn admin-btn-secondary" onClick={() => void copyToClipboard(createdApiKey)}>
                  Copy secret
                </button>
              </div>
              <pre className="admin-code">{createdApiKey}</pre>
            </div>
          ) : null}
        </section>

        <section className="admin-card">
          <div className="admin-section-header admin-section-header-compact">
            <div>
              <p className="admin-kicker">Key inventory</p>
              <h3 className="admin-section-subtitle">Inspect, disable, or rehabilitate credentials</h3>
              <p className="admin-section-copy">
                Search by key ID, label, or scope. Use disable when a key is exposed or behaving unexpectedly.
              </p>
            </div>
            <button className="admin-btn admin-btn-secondary" onClick={() => void loadKeys()} disabled={!token || keysLoading}>
              {keysLoading ? "Loading..." : "Reload keys"}
            </button>
          </div>

          <div className="admin-panel-grid">
            <div className="admin-subpanel">
              <label className="admin-field admin-field-compact">
                <span>Find a key</span>
                <input
                  placeholder="Search by label, key ID, or scope"
                  value={keyFilter}
                  onChange={(event) => setKeyFilter(event.target.value)}
                />
              </label>

              <div className="admin-inline-hints admin-inline-hints-compact">
                <div className="admin-chip">{filteredKeys.length} shown</div>
                <div className="admin-chip">{keys.length} total loaded</div>
              </div>

              <div className="admin-key-list">
                {filteredKeys.length ? (
                  filteredKeys.map((keyItem) => {
                    const isSelected = keyItem.key_id === selectedKeyId;
                    return (
                      <button
                        key={keyItem.key_id}
                        type="button"
                        className={"admin-key-row" + (isSelected ? " is-selected" : "")}
                        onClick={() => setSelectedKeyId(keyItem.key_id)}
                      >
                        <div className="admin-key-row-top">
                          <strong>{keyItem.label}</strong>
                          <span className={keyBadgeClassName(keyItem)}>{keyStatusLabel(keyItem)}</span>
                        </div>
                        <div className="admin-key-meta">{keyItem.key_id}</div>
                        <div className="admin-chip-list">
                          {keyItem.scopes.length ? (
                            keyItem.scopes.map((scope) => (
                              <span key={keyItem.key_id + "-" + scope} className="admin-chip">
                                {scope}
                              </span>
                            ))
                          ) : (
                            <span className="admin-chip">no scopes listed</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="admin-empty-state">No keys matched your current filter.</div>
                )}
              </div>
            </div>

            <div className="admin-subpanel">
              <p className="admin-mini-label">Selected key</p>
              {selectedKey ? (
                <div className="admin-detail-stack">
                  <div className="admin-detail-grid">
                    <div className="admin-detail-card">
                      <span className="admin-detail-label">Label</span>
                      <strong>{selectedKey.label}</strong>
                    </div>
                    <div className="admin-detail-card">
                      <span className="admin-detail-label">Status</span>
                      <strong>{keyStatusLabel(selectedKey)}</strong>
                    </div>
                    <div className="admin-detail-card">
                      <span className="admin-detail-label">Created</span>
                      <strong>{selectedKey.created_utc}</strong>
                    </div>
                    <div className="admin-detail-card">
                      <span className="admin-detail-label">Last used</span>
                      <strong>{selectedKey.last_used_utc}</strong>
                    </div>
                  </div>

                  <ul className="admin-bullet-list">
                    <li>Window limit: {selectedKey.window_limit ?? selectedKey.rate_limit_per_minute ?? "Not exposed"}</li>
                    <li>Window seconds: {selectedKey.window_seconds ?? "Not exposed"}</li>
                    <li>Bucket seconds: {selectedKey.bucket_seconds ?? "Not exposed"}</li>
                    <li>Daily limit: {selectedKey.daily_limit ?? "Not exposed"}</li>
                    <li>Total requests: {selectedKey.total_requests ?? "Not exposed"}</li>
                    <li>Blocked requests: {selectedKey.blocked_requests ?? "Not exposed"}</li>
                  </ul>

                  <div className="admin-chip-list">
                    {selectedKey.scopes.map((scope) => (
                      <span key={"selected-" + scope} className="admin-chip">
                        {scope}
                      </span>
                    ))}
                  </div>

                  <div className="admin-toolbar admin-toolbar-tight">
                    <button
                      className={"admin-btn " + (selectedKey.active ? "admin-btn-danger" : "admin-btn-primary")}
                      onClick={() =>
                        void runKeyAction(selectedKey.key_id, selectedKey.active ? "disable" : "enable")
                      }
                      disabled={!token || Boolean(keyActionBusy)}
                    >
                      {keyActionBusy === (selectedKey.key_id + ":" + (selectedKey.active ? "disable" : "enable"))
                        ? selectedKey.active
                          ? "Disabling..."
                          : "Enabling..."
                        : selectedKey.active
                          ? "Disable key"
                          : "Enable key"}
                    </button>
                    <button
                      className="admin-btn admin-btn-secondary"
                      onClick={() => void runKeyAction(selectedKey.key_id, "reset-counters")}
                      disabled={!token || Boolean(keyActionBusy)}
                    >
                      {keyActionBusy === selectedKey.key_id + ":reset-counters" ? "Resetting..." : "Reset counters"}
                    </button>
                    <button
                      className="admin-btn admin-btn-secondary"
                      onClick={() => void copyToClipboard(selectedKey.key_id)}
                    >
                      Copy key ID
                    </button>
                  </div>

                  <details className="admin-raw-toggle">
                    <summary>Open raw key JSON</summary>
                    <pre className="admin-code">{fmtJson(selectedKey.raw)}</pre>
                  </details>
                </div>
              ) : (
                <div className="admin-empty-state">Select a key on the left to inspect it.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      <aside className="admin-side-column">
        <section className="admin-card">
          <p className="admin-kicker">Session summary</p>
          <h3 className="admin-section-subtitle">Who is controlling the site right now</h3>
          <div className="admin-detail-stack">
            <div className="admin-detail-card">
              <span className="admin-detail-label">API base</span>
              <strong>{base || "Missing NEXT_PUBLIC_API_BASE_URL"}</strong>
            </div>
            <div className="admin-detail-card">
              <span className="admin-detail-label">Signed in as</span>
              <strong>{meEmail || "No authenticated session"}</strong>
            </div>
            <div className="admin-notice admin-notice-info">
              Tokens are never printed automatically on screen. Copy them only when you truly need them, then keep them out of chat logs and screenshots.
            </div>
          </div>
        </section>

        <section className="admin-card">
          <p className="admin-kicker">Admin playbook</p>
          <h3 className="admin-section-subtitle">How to manage the website as an admin</h3>
          <p className="admin-section-copy">
            Treat this like a short operational routine: orient yourself, make the smallest safe change, and keep risky actions reversible.
          </p>

          <div className="admin-step-list">
            {PLAYBOOK_STEPS.map((step, index) => (
              <article key={step.title} className="admin-step-card">
                <div className="admin-step-heading">
                  <span className="admin-step-number">{index + 1}</span>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.body}</p>
                  </div>
                </div>
                <ul className="admin-bullet-list">
                  {step.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <p className="admin-kicker">Protected tasks</p>
          <h3 className="admin-section-subtitle">When the dashboard is not enough</h3>
          <p className="admin-section-copy">
            Use the backend workspace for identity, roles, and content seeding. These tasks are intentionally kept outside the browser dashboard.
          </p>

          <div className="admin-step-list">
            {ADVANCED_TASKS.map((task) => (
              <article key={task.title} className="admin-step-card">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <code className="admin-code admin-code-inline">{task.command}</code>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
