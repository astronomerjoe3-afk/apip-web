
"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { apipGet, apipPost } from "../../lib/apipApi";
import { auth } from "../../lib/firebase";
import { getClientRole, isAcademicLeadRole, isInstitutionStaffRole, roleDisplayName } from "../../lib/authRouting";
import { signOutEverywhere } from "../../lib/sessionClient";
import {
  buildAnalysedRows,
  buildLessonInsights,
  buildMisconceptionMap,
  buildSummary,
  errorMessage,
  matchesFilter,
  sizeLabel,
} from "./analytics";
import CohortMap from "./CohortMap";
import ContentPanel from "./ContentPanel";
import InsightsPanel from "./InsightsPanel";
import InstructorSidebar from "./InstructorSidebar";
import OverviewPanel from "./OverviewPanel";
import RosterPanel from "./RosterPanel";
import SupportInboxPanel from "./SupportInboxPanel";
import type { ApiResp, ReadinessFilter, Role, SupportAction, SupportInquiry, UploadItem } from "./types";

type SupportInboxResp = {
  ok: boolean;
  inquiries: SupportInquiry[];
};

type SupportInquiryActionResp = {
  ok: boolean;
  request?: SupportInquiry;
};

function summarizeWarnings(items: string[]): string[] {
  const compactItems = items
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const indexWarnings = compactItems.filter((item) =>
    /events_ordering_missing_index_fallback|requires an index|firestore\/indexes\?create/i.test(item)
  );
  const otherWarnings = compactItems.filter((item) => !indexWarnings.includes(item));
  const summaries: string[] = [];

  if (indexWarnings.length) {
    const countLabel = indexWarnings.length === 1 ? "One analytics query is" : `${indexWarnings.length} analytics queries are`;
    summaries.push(`${countLabel} using fallback ordering because a Firestore index is still missing. Create the index in Firebase, then reload this dashboard.`);
  }

  const seen = new Set<string>();
  for (const warning of otherWarnings) {
    const normalized = warning.replace(/https?:\/\/\S+/gi, "").replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    summaries.push(normalized);
  }

  return summaries;
}

export default function InstructorPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("unknown");
  const [moduleId, setModuleId] = useState<string>("F1");
  const [rows, setRows] = useState<ApiResp["students"]>([]);
  const [err, setErr] = useState<string>("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [supportInquiries, setSupportInquiries] = useState<SupportInquiry[]>([]);
  const [supportLoading, setSupportLoading] = useState<boolean>(true);
  const [resolvingInquiryId, setResolvingInquiryId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [readinessFilter, setReadinessFilter] = useState<ReadinessFilter>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [supportActions, setSupportActions] = useState<Record<string, SupportAction>>({});
  const [uploadSection, setUploadSection] = useState<string>("Lesson visuals");
  const [uploadTag, setUploadTag] = useState<string>("Priority reteach");
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setRole("unknown");
        setLoading(false);
        router.replace("/");
        return;
      }
      try {
        const nextRole = await getClientRole(nextUser);
        setRole(nextRole);
        if (nextRole === "student") {
          router.replace("/student");
        } else if (isInstitutionStaffRole(nextRole)) {
          router.replace("/institution");
        } else if (nextRole === "unknown") {
          router.replace("/dashboard");
        }
      } catch {
        setRole("unknown");
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const doLogout = useCallback(async (): Promise<void> => {
    await signOutEverywhere();
    router.replace("/");
  }, [router]);

  const load = useCallback(async (): Promise<void> => {
    try {
      setErr("");
      setWarnings([]);
      setSupportLoading(true);
      const pathValue = "/instructor/module/" + encodeURIComponent(moduleId) + "/students?limit=50";
      const supportPath = "/instructor/help-requests?status=open&limit=12&module_id=" + encodeURIComponent(moduleId);
      const [dataResult, supportResult] = await Promise.allSettled([
        apipGet<ApiResp>(pathValue),
        apipGet<SupportInboxResp>(supportPath),
      ]);

      if (dataResult.status === "rejected") {
        throw dataResult.reason;
      }

      const data = dataResult.value;
      const nextWarnings = Array.isArray(data.warnings) ? [...data.warnings] : [];
      setRows(Array.isArray(data.students) ? data.students : []);

      if (supportResult.status === "fulfilled") {
        setSupportInquiries(Array.isArray(supportResult.value.inquiries) ? supportResult.value.inquiries : []);
      } else {
        setSupportInquiries([]);
        nextWarnings.push("student_help_inbox_unavailable: recent inquiry inbox could not be loaded.");
      }

      setWarnings(nextWarnings);
    } catch (error: unknown) {
      setErr(errorMessage(error));
      setRows([]);
      setSupportInquiries([]);
    } finally {
      setSupportLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    if (isAcademicLeadRole(role) || role === "admin") void load();
  }, [role, load]);
  const analysedRows = useMemo(() => buildAnalysedRows(rows), [rows]);
  const filteredStudents = useMemo(() => analysedRows.filter((entry) => matchesFilter(entry, readinessFilter, search)), [analysedRows, readinessFilter, search]);
  const summary = useMemo(() => buildSummary(analysedRows), [analysedRows]);
  const misconceptionMap = useMemo(() => buildMisconceptionMap(analysedRows), [analysedRows]);
  const lessonInsights = useMemo(() => buildLessonInsights(analysedRows), [analysedRows]);
  const riskQueue = useMemo(() => analysedRows.filter((entry) => entry.risk.level !== "low").slice(0, 6), [analysedRows]);
  const loadQueue = useMemo(() => analysedRows.filter((entry) => entry.load.level !== "steady").slice(0, 6), [analysedRows]);

  useEffect(() => {
    if (!filteredStudents.length) {
      setSelectedStudentId("");
      return;
    }
    if (!filteredStudents.some((entry) => entry.row.uid === selectedStudentId)) {
      setSelectedStudentId(filteredStudents[0].row.uid);
    }
  }, [filteredStudents, selectedStudentId]);

  const selectedStudent = useMemo(() => filteredStudents.find((entry) => entry.row.uid === selectedStudentId) || null, [filteredStudents, selectedStudentId]);
  const selectedLessons = useMemo(() => {
    if (!selectedStudent) return [];
    return Object.entries(selectedStudent.row.per_lesson || {}).sort(([left], [right]) => left.localeCompare(right));
  }, [selectedStudent]);

  const actionCounts = useMemo(() => ({
    Monitor: Object.values(supportActions).filter((value) => value === "Monitor").length,
    Reteach: Object.values(supportActions).filter((value) => value === "Reteach").length,
    "Office hours": Object.values(supportActions).filter((value) => value === "Office hours").length,
    Celebrate: Object.values(supportActions).filter((value) => value === "Celebrate").length,
  }), [supportActions]);
  const uploadSummary = useMemo(() => {
    const counts = new Map<string, number>();
    uploadQueue.forEach((item) => {
      counts.set(item.section, (counts.get(item.section) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((left, right) => right[1] - left[1]);
  }, [uploadQueue]);
  const visibleWarnings = useMemo(() => summarizeWarnings(warnings), [warnings]);

  const cohortPulse = summary.highRisk > 0 ? String(summary.highRisk) + " urgent follow-ups" : "Stable today";
  const header = role === "admin" ? "Academic Lead Dashboard (Admin)" : `${roleDisplayName(role)} Dashboard`;

  const handleUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const addedAt = String(Date.now());
    const nextItems: UploadItem[] = files.map((file, index) => ({
      id: addedAt + "-" + String(index) + "-" + file.name,
      name: file.name,
      sizeLabel: sizeLabel(file.size),
      section: uploadSection,
      tag: uploadTag,
      status: "Queued" as const,
    }));
    setUploadQueue((current) => nextItems.concat(current).slice(0, 30));
    event.target.value = "";
  }, [uploadSection, uploadTag]);

  const toggleUploadStatus = useCallback((uploadId: string) => {
    setUploadQueue((current) => current.map((item) => item.id === uploadId ? { ...item, status: item.status === "Queued" ? "Sorted" : "Queued" } : item));
  }, []);

  const removeUpload = useCallback((uploadId: string) => {
    setUploadQueue((current) => current.filter((item) => item.id !== uploadId));
  }, []);

  const resolveInquiry = useCallback(async (inquiryId: string): Promise<void> => {
    if (!inquiryId || resolvingInquiryId) return;
    setResolvingInquiryId(inquiryId);
    setErr("");
    try {
      await apipPost<SupportInquiryActionResp, Record<string, never>>(`/instructor/help-requests/${encodeURIComponent(inquiryId)}/resolve`, {});
      setSupportInquiries((current) => current.filter((item) => item.id !== inquiryId));
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setResolvingInquiryId("");
    }
  }, [resolvingInquiryId]);

  const assignAction = useCallback((uid: string, action: SupportAction) => {
    setSupportActions((current) => ({ ...current, [uid]: action }));
  }, []);
  if (loading) {
    return <div style={{ padding: 24, opacity: 0.85 }}>Loading academic lead workspace...</div>;
  }

  if (!(isAcademicLeadRole(role) || role === "admin")) {
    return <div style={{ padding: 24, opacity: 0.85 }}>Redirecting...</div>;
  }

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero">
        <div className="admin-section-header">
          <div>
            <p className="dashboard-eyebrow">Cognispark academic studio</p>
            <h1 className="dashboard-title">{header}</h1>
            <p className="dashboard-subtitle">
              Spot cross-platform misconceptions early, protect student momentum, organize upcoming content, and oversee academic quality from one calm workspace.
            </p>
          </div>

          <div className="admin-toolbar">
            <a className="admin-btn admin-btn-secondary" href="/dashboard">Back to dashboard</a>
            <a className="admin-btn admin-btn-secondary" href="/operations-guide#instructor-overview">Operations guide</a>
            <button className="admin-btn admin-btn-primary" onClick={() => void load()} type="button">Reload cohort</button>
            <button className="admin-btn admin-btn-secondary" onClick={() => void doLogout()} type="button">Logout</button>
          </div>
        </div>

        <div className="dashboard-identity-grid">
          <article className="dashboard-identity-card"><span>Signed in</span><strong>{user?.email || "-"}</strong></article>
          <article className="dashboard-identity-card"><span>Module in view</span><strong>{moduleId}</strong></article>
          <article className="dashboard-identity-card"><span>Cohort pulse</span><strong>{cohortPulse}</strong></article>
        </div>
      </section>
      {err ? (
        <section className="admin-card admin-notice admin-notice-error" style={{ marginTop: "1rem" }}>
          <strong>Could not load academic lead data</strong>
          <p className="admin-section-copy">{err}</p>
        </section>
      ) : null}

      {visibleWarnings.length ? (
        <section className="admin-card admin-notice admin-notice-warning" style={{ marginTop: "1rem" }}>
          <div className="admin-section-header admin-section-header-compact">
            <div>
              <p className="admin-kicker">Data warnings</p>
              <h2 className="admin-section-subtitle">Some analytics are using fallbacks</h2>
            </div>
          </div>
          <ul className="admin-bullet-list" style={{ marginTop: "0.8rem", paddingLeft: "1.1rem" }}>
            {visibleWarnings.slice(0, 6).map((warning, index) => (
              <li key={warning + "-" + String(index)}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="admin-layout">
        <div className="admin-stack">
          <OverviewPanel moduleId={moduleId} cohortPulse={cohortPulse} summary={summary} onModuleChange={setModuleId} />
          <SupportInboxPanel
            inquiries={supportInquiries}
            loading={supportLoading}
            moduleId={moduleId}
            resolvingId={resolvingInquiryId}
            onResolve={resolveInquiry}
          />
          <CohortMap cohortSize={summary.cohortSize} items={misconceptionMap} />
          <RosterPanel
            rows={filteredStudents}
            search={search}
            readinessFilter={readinessFilter}
            setSearch={setSearch}
            setReadinessFilter={setReadinessFilter}
            selectedStudentId={selectedStudentId}
            setSelectedStudentId={setSelectedStudentId}
            selectedStudent={selectedStudent}
            selectedLessons={selectedLessons}
            supportActions={supportActions}
            assignAction={assignAction}
          />
          <InsightsPanel rows={analysedRows} summary={summary} lessons={lessonInsights} />
          <ContentPanel
            uploadQueue={uploadQueue}
            uploadSection={uploadSection}
            uploadTag={uploadTag}
            setUploadSection={setUploadSection}
            setUploadTag={setUploadTag}
            handleUpload={handleUpload}
            toggleUploadStatus={toggleUploadStatus}
            removeUpload={removeUpload}
            clearUploads={() => setUploadQueue([])}
            uploadSummary={uploadSummary}
          />
        </div>

        <InstructorSidebar riskQueue={riskQueue} loadQueue={loadQueue} actionCounts={actionCounts} />
      </div>
    </div>
  );
}
