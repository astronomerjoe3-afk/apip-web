"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { apipGet, apipPost } from "../../lib/apipApi";
import { auth } from "../../lib/firebase";
import {
  getClientRole,
  isAcademicLeadRole,
  isInstitutionStaffRole,
  roleDisplayName,
  type Role,
} from "../../lib/authRouting";
import { signOutEverywhere } from "../../lib/sessionClient";

type Discussion = {
  id: string;
  scope: string;
  title: string;
  body: string;
  class_name?: string;
  module_id?: string | null;
  created_utc?: string | null;
};

type Submission = {
  id: string;
  assignment_id: string;
  assignment_title: string;
  student_email?: string | null;
  status: string;
  text_response?: string | null;
  link_url?: string | null;
  attachment_names?: string[];
  score?: number | null;
  feedback?: string | null;
  submitted_utc?: string | null;
};

type Assignment = {
  id: string;
  class_id: string;
  class_name: string;
  title: string;
  assignment_type: string;
  instructions: string;
  due_utc?: string | null;
  grading_mode: string;
  status: string;
  resource_module_ids: string[];
  resource_titles?: string[];
  your_submission?: {
    id: string;
    status: string;
    score?: number | null;
    feedback?: string | null;
    submitted_utc?: string | null;
  } | null;
};

type ClassRoom = {
  id: string;
  name: string;
  term?: string | null;
  topic_focus?: string | null;
  join_code?: string | null;
  teacher_names: string[];
  student_count: number;
  pending_grading_count: number;
  assignments: Assignment[];
  submissions: Submission[];
  discussions: Discussion[];
};

type Member = {
  uid: string;
  email?: string | null;
  display_name?: string | null;
  role: string;
};

type InstitutionBlock = {
  institution: {
    id: string;
    name: string;
    slug: string;
    status: string;
    committed_student_seats: number;
    active_student_count: number;
    active_teacher_count: number;
    class_count: number;
    assignment_count: number;
    pending_grading_count: number;
    seat_utilization_ratio: number;
    public_community_enabled: boolean;
    seat_band: {
      label: string;
      range_label: string;
    };
  };
  membership?: {
    role: string;
    email?: string | null;
  } | null;
  permissions: {
    can_manage_billing: boolean;
    can_manage_members: boolean;
    can_manage_classes: boolean;
    can_create_assignments: boolean;
    can_grade_submissions: boolean;
    can_view_school_analytics: boolean;
    can_participate_public_topics: boolean;
    read_only: boolean;
  };
  members: {
    institution_admins: Member[];
    teachers: Member[];
    students: Member[];
  };
  classes: ClassRoom[];
  recent_assignments: Assignment[];
  recent_submissions: Submission[];
  discussions: Discussion[];
};

type WorkspaceResponse = {
  ok: boolean;
  viewer: {
    role: Role;
    is_admin: boolean;
    is_academic_lead: boolean;
    can_create_institutions: boolean;
    can_access_public_topics: boolean;
  };
  global_summary: {
    institution_count: number;
    class_count: number;
    assignment_count: number;
    pending_grading_count: number;
  };
  public_topic_discussions: Discussion[];
  institutions: InstitutionBlock[];
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export default function InstitutionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("unknown");
  const [loading, setLoading] = useState<boolean>(true);
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [flash, setFlash] = useState<string>("");
  const [busy, setBusy] = useState<string>("");
  const [institutionForm, setInstitutionForm] = useState({
    name: "",
    committed_student_seats: "120",
  });
  const [membershipForm, setMembershipForm] = useState({
    uid: "",
    email: "",
    display_name: "",
    role: "student",
  });
  const [classForm, setClassForm] = useState({
    name: "",
    term: "",
    topic_focus: "",
    teacher_uids: "",
    student_uids: "",
  });
  const [assignmentForm, setAssignmentForm] = useState({
    class_id: "",
    title: "",
    assignment_type: "platform_resource",
    instructions: "",
    resource_module_ids: "",
    due_utc: "",
  });
  const [discussionForm, setDiscussionForm] = useState({
    scope: "institution",
    class_id: "",
    module_id: "",
    title: "",
    body: "",
  });
  const [gradeForm, setGradeForm] = useState({
    submission_id: "",
    score: "",
    feedback: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setRole("unknown");
        setLoading(false);
        router.replace("/login?next=/institution");
        return;
      }

      try {
        const nextRole = await getClientRole(nextUser);
        setRole(nextRole);
        if (nextRole === "student") {
          router.replace("/student");
        } else if (!(nextRole === "admin" || isAcademicLeadRole(nextRole) || isInstitutionStaffRole(nextRole))) {
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

  async function loadWorkspace(): Promise<void> {
    try {
      setErr("");
      const data = await apipGet<WorkspaceResponse>("/institutions/workspace");
      setWorkspace(data);
      setSelectedInstitutionId((current) => current || data.institutions[0]?.institution.id || "");
    } catch (error: unknown) {
      setErr(errorMessage(error));
      setWorkspace(null);
    }
  }

  useEffect(() => {
    if (!loading && (role === "admin" || isAcademicLeadRole(role) || isInstitutionStaffRole(role))) {
      void loadWorkspace();
    }
  }, [loading, role]);

  const selectedBlock = useMemo(
    () => workspace?.institutions.find((item) => item.institution.id === selectedInstitutionId) || workspace?.institutions[0] || null,
    [selectedInstitutionId, workspace],
  );

  useEffect(() => {
    if (!selectedBlock) {
      return;
    }
    if (!assignmentForm.class_id) {
      setAssignmentForm((current) => ({
        ...current,
        class_id: selectedBlock.classes[0]?.id || "",
      }));
    }
    if (!discussionForm.class_id) {
      setDiscussionForm((current) => ({
        ...current,
        class_id: selectedBlock.classes[0]?.id || "",
      }));
    }
    if (!gradeForm.submission_id) {
      setGradeForm((current) => ({
        ...current,
        submission_id: selectedBlock.recent_submissions[0]?.id || "",
      }));
    }
  }, [assignmentForm.class_id, discussionForm.class_id, gradeForm.submission_id, selectedBlock]);

  async function doLogout(): Promise<void> {
    await signOutEverywhere();
    router.replace("/login");
  }

  async function createInstitution(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy("institution");
    setFlash("");
    try {
      await apipPost("/institutions", {
        name: institutionForm.name,
        committed_student_seats: Number(institutionForm.committed_student_seats || "0"),
      });
      setInstitutionForm({ name: "", committed_student_seats: "120" });
      setFlash("Institution created.");
      await loadWorkspace();
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBusy("");
    }
  }

  async function createMembership(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedBlock) return;
    setBusy("membership");
    setFlash("");
    try {
      await apipPost(`/institutions/${encodeURIComponent(selectedBlock.institution.id)}/memberships`, membershipForm);
      setMembershipForm({ uid: "", email: "", display_name: "", role: "student" });
      setFlash("Member added to institution.");
      await loadWorkspace();
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBusy("");
    }
  }

  async function createClass(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedBlock) return;
    setBusy("class");
    setFlash("");
    try {
      await apipPost(`/institutions/${encodeURIComponent(selectedBlock.institution.id)}/classes`, {
        ...classForm,
        teacher_uids: classForm.teacher_uids.split(",").map((item) => item.trim()).filter(Boolean),
        student_uids: classForm.student_uids.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setClassForm({ name: "", term: "", topic_focus: "", teacher_uids: "", student_uids: "" });
      setFlash("Class created.");
      await loadWorkspace();
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBusy("");
    }
  }

  async function createAssignment(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedBlock) return;
    setBusy("assignment");
    setFlash("");
    try {
      await apipPost(`/institutions/${encodeURIComponent(selectedBlock.institution.id)}/assignments`, {
        ...assignmentForm,
        resource_module_ids: assignmentForm.resource_module_ids.split(",").map((item) => item.trim()).filter(Boolean),
        due_utc: assignmentForm.due_utc || null,
      });
      setAssignmentForm({
        class_id: selectedBlock.classes[0]?.id || "",
        title: "",
        assignment_type: "platform_resource",
        instructions: "",
        resource_module_ids: "",
        due_utc: "",
      });
      setFlash("Assignment created.");
      await loadWorkspace();
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBusy("");
    }
  }

  async function createDiscussion(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy("discussion");
    setFlash("");
    try {
      await apipPost("/institutions/discussions", {
        ...discussionForm,
        institution_id: selectedBlock?.institution.id || null,
        class_id: discussionForm.scope === "class" ? discussionForm.class_id || null : null,
        module_id: discussionForm.module_id || null,
      });
      setDiscussionForm((current) => ({ ...current, title: "", body: "", module_id: "" }));
      setFlash("Discussion posted.");
      await loadWorkspace();
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBusy("");
    }
  }

  async function gradeSubmission(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy("grade");
    setFlash("");
    try {
      await apipPost(`/institutions/submissions/${encodeURIComponent(gradeForm.submission_id)}/grade`, {
        score: gradeForm.score ? Number(gradeForm.score) : null,
        feedback: gradeForm.feedback,
        status: "graded",
      });
      setFlash("Submission graded.");
      await loadWorkspace();
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBusy("");
    }
  }

  if (loading) {
    return <div style={{ padding: 24, opacity: 0.85 }}>Loading institution workspace...</div>;
  }

  if (!(role === "admin" || isAcademicLeadRole(role) || isInstitutionStaffRole(role))) {
    return <div style={{ padding: 24, opacity: 0.85 }}>Redirecting...</div>;
  }

  const selectedClasses = selectedBlock?.classes || [];
  const roleOptions = selectedBlock?.membership?.role === "teacher" ? ["student"] : ["student", "teacher", "institution_admin"];

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero">
        <div className="admin-section-header">
          <div>
            <p className="dashboard-eyebrow">Cognispark institutional layer</p>
            <h1 className="dashboard-title">{roleDisplayName(role)} workspace</h1>
            <p className="dashboard-subtitle">
              Run school-scoped classes, assignments, grading, roster management, and community spaces without leaving the existing platform.
            </p>
          </div>
          <div className="admin-toolbar">
            <a className="admin-btn admin-btn-secondary" href="/dashboard">Back to dashboard</a>
            <button className="admin-btn admin-btn-secondary" onClick={() => void loadWorkspace()} type="button">Reload</button>
            <button className="admin-btn admin-btn-secondary" onClick={() => void doLogout()} type="button">Logout</button>
          </div>
        </div>

        <div className="dashboard-identity-grid">
          <article className="dashboard-identity-card"><span>Signed in</span><strong>{user?.email || "-"}</strong></article>
          <article className="dashboard-identity-card"><span>Institutions</span><strong>{workspace?.global_summary.institution_count || 0}</strong></article>
          <article className="dashboard-identity-card"><span>Pending grading</span><strong>{workspace?.global_summary.pending_grading_count || 0}</strong></article>
        </div>
      </section>

      {err ? <section className="admin-notice admin-notice-error" style={{ marginTop: "1rem" }}>{err}</section> : null}
      {flash ? <section className="admin-notice admin-notice-success" style={{ marginTop: "1rem" }}>{flash}</section> : null}

      <div className="admin-layout" style={{ marginTop: "1.5rem" }}>
        <div className="admin-stack">
          <section className="admin-card">
            <div className="admin-section-header admin-section-header-compact">
              <div>
                <p className="admin-kicker">Workspace summary</p>
                <h2 className="admin-section-title">Institutional rollout at a glance</h2>
              </div>
            </div>
            <div className="admin-stat-grid" style={{ marginTop: "1rem" }}>
              <article className="admin-stat-card"><p className="admin-stat-label">Institutions</p><p className="admin-stat-value">{workspace?.global_summary.institution_count || 0}</p></article>
              <article className="admin-stat-card"><p className="admin-stat-label">Classes in scope</p><p className="admin-stat-value">{workspace?.global_summary.class_count || 0}</p></article>
              <article className="admin-stat-card"><p className="admin-stat-label">Assignments</p><p className="admin-stat-value">{workspace?.global_summary.assignment_count || 0}</p></article>
              <article className="admin-stat-card"><p className="admin-stat-label">Pending grading</p><p className="admin-stat-value">{workspace?.global_summary.pending_grading_count || 0}</p></article>
            </div>
          </section>

          {workspace?.viewer.can_create_institutions ? (
            <section className="admin-card">
              <div className="admin-section-header admin-section-header-compact">
                <div>
                  <p className="admin-kicker">Platform admin</p>
                  <h2 className="admin-section-subtitle">Create institution tenant</h2>
                </div>
              </div>
              <form className="admin-form-grid" onSubmit={(event) => void createInstitution(event)} style={{ marginTop: "1rem" }}>
                <label className="admin-field"><span>Name</span><input value={institutionForm.name} onChange={(event) => setInstitutionForm((current) => ({ ...current, name: event.target.value }))} /></label>
                <label className="admin-field"><span>Committed seats</span><input value={institutionForm.committed_student_seats} onChange={(event) => setInstitutionForm((current) => ({ ...current, committed_student_seats: event.target.value }))} /></label>
                <button className="admin-btn admin-btn-primary" disabled={busy === "institution"} type="submit">{busy === "institution" ? "Creating..." : "Create institution"}</button>
              </form>
            </section>
          ) : null}

          {selectedBlock ? (
            <>
              <section className="admin-card">
                <div className="admin-section-header admin-section-header-compact">
                  <div>
                    <p className="admin-kicker">Institution selector</p>
                    <h2 className="admin-section-subtitle">{selectedBlock.institution.name}</h2>
                    <p className="admin-section-copy">{selectedBlock.institution.seat_band.label} | {selectedBlock.institution.seat_band.range_label}</p>
                  </div>
                </div>
                <div className="admin-chip-list" style={{ marginTop: "1rem" }}>
                  {(workspace?.institutions || []).map((block) => (
                    <button
                      key={block.institution.id}
                      className="admin-chip"
                      onClick={() => setSelectedInstitutionId(block.institution.id)}
                      type="button"
                      style={{ border: block.institution.id === selectedBlock.institution.id ? "2px solid #10233f" : undefined }}
                    >
                      {block.institution.name}
                    </button>
                  ))}
                </div>
                <div className="admin-panel-grid" style={{ marginTop: "1rem" }}>
                  <div className="admin-subpanel"><strong>Students</strong><p>{selectedBlock.institution.active_student_count} active learners</p></div>
                  <div className="admin-subpanel"><strong>Teachers</strong><p>{selectedBlock.institution.active_teacher_count} teaching accounts</p></div>
                  <div className="admin-subpanel"><strong>Seats</strong><p>{selectedBlock.institution.active_student_count}/{selectedBlock.institution.committed_student_seats} used</p></div>
                  <div className="admin-subpanel"><strong>Community</strong><p>{selectedBlock.institution.public_community_enabled ? "Public topics enabled" : "School-only by default"}</p></div>
                </div>
              </section>

              {selectedBlock.permissions.read_only ? (
                <section className="admin-notice admin-notice-info">
                  Academic lead access is read-only here. Use this view for school health and trend monitoring while local classroom setup stays with institution admins and teachers.
                </section>
              ) : null}

              <section className="admin-card">
                <div className="admin-section-header admin-section-header-compact">
                  <div>
                    <p className="admin-kicker">Institution actions</p>
                    <h2 className="admin-section-subtitle">Roster, class, assignment, and discussion tools</h2>
                  </div>
                </div>
                <div className="admin-panel-grid" style={{ marginTop: "1rem" }}>
                  {selectedBlock.permissions.can_manage_members ? (
                    <form className="admin-subpanel" onSubmit={(event) => void createMembership(event)}>
                      <strong>Add member</strong>
                      <label className="admin-field admin-field-compact"><span>UID</span><input value={membershipForm.uid} onChange={(event) => setMembershipForm((current) => ({ ...current, uid: event.target.value }))} /></label>
                      <label className="admin-field admin-field-compact"><span>Email</span><input value={membershipForm.email} onChange={(event) => setMembershipForm((current) => ({ ...current, email: event.target.value }))} /></label>
                      <label className="admin-field admin-field-compact"><span>Name</span><input value={membershipForm.display_name} onChange={(event) => setMembershipForm((current) => ({ ...current, display_name: event.target.value }))} /></label>
                      <label className="admin-field admin-field-compact"><span>Role</span><select value={membershipForm.role} onChange={(event) => setMembershipForm((current) => ({ ...current, role: event.target.value }))}>{roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                      <button className="admin-btn admin-btn-primary" disabled={busy === "membership"} type="submit">{busy === "membership" ? "Saving..." : "Add member"}</button>
                    </form>
                  ) : null}

                  {selectedBlock.permissions.can_manage_classes ? (
                    <form className="admin-subpanel" onSubmit={(event) => void createClass(event)}>
                      <strong>Create class</strong>
                      <label className="admin-field admin-field-compact"><span>Name</span><input value={classForm.name} onChange={(event) => setClassForm((current) => ({ ...current, name: event.target.value }))} /></label>
                      <label className="admin-field admin-field-compact"><span>Term</span><input value={classForm.term} onChange={(event) => setClassForm((current) => ({ ...current, term: event.target.value }))} /></label>
                      <label className="admin-field admin-field-compact"><span>Topic focus</span><input value={classForm.topic_focus} onChange={(event) => setClassForm((current) => ({ ...current, topic_focus: event.target.value }))} /></label>
                      <label className="admin-field admin-field-compact"><span>Teacher UIDs</span><input value={classForm.teacher_uids} onChange={(event) => setClassForm((current) => ({ ...current, teacher_uids: event.target.value }))} placeholder="teacher-1, teacher-2" /></label>
                      <label className="admin-field admin-field-compact"><span>Student UIDs</span><input value={classForm.student_uids} onChange={(event) => setClassForm((current) => ({ ...current, student_uids: event.target.value }))} placeholder="student-1, student-2" /></label>
                      <button className="admin-btn admin-btn-primary" disabled={busy === "class"} type="submit">{busy === "class" ? "Creating..." : "Create class"}</button>
                    </form>
                  ) : null}

                  {selectedBlock.permissions.can_create_assignments ? (
                    <form className="admin-subpanel" onSubmit={(event) => void createAssignment(event)}>
                      <strong>Create assignment</strong>
                      <label className="admin-field admin-field-compact"><span>Class</span><select value={assignmentForm.class_id} onChange={(event) => setAssignmentForm((current) => ({ ...current, class_id: event.target.value }))}>{selectedClasses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                      <label className="admin-field admin-field-compact"><span>Title</span><input value={assignmentForm.title} onChange={(event) => setAssignmentForm((current) => ({ ...current, title: event.target.value }))} /></label>
                      <label className="admin-field admin-field-compact"><span>Type</span><select value={assignmentForm.assignment_type} onChange={(event) => setAssignmentForm((current) => ({ ...current, assignment_type: event.target.value }))}><option value="platform_resource">platform_resource</option><option value="custom">custom</option><option value="external">external</option></select></label>
                      <label className="admin-field admin-field-compact"><span>Module IDs</span><input value={assignmentForm.resource_module_ids} onChange={(event) => setAssignmentForm((current) => ({ ...current, resource_module_ids: event.target.value }))} placeholder="F2, M3" /></label>
                      <label className="admin-field admin-field-compact"><span>Due UTC</span><input value={assignmentForm.due_utc} onChange={(event) => setAssignmentForm((current) => ({ ...current, due_utc: event.target.value }))} placeholder="2026-04-01T09:00:00+00:00" /></label>
                      <label className="admin-field admin-field-compact"><span>Instructions</span><textarea value={assignmentForm.instructions} onChange={(event) => setAssignmentForm((current) => ({ ...current, instructions: event.target.value }))} rows={4} /></label>
                      <button className="admin-btn admin-btn-primary" disabled={busy === "assignment"} type="submit">{busy === "assignment" ? "Creating..." : "Create assignment"}</button>
                    </form>
                  ) : null}

                  {!selectedBlock.permissions.read_only ? (
                    <form className="admin-subpanel" onSubmit={(event) => void createDiscussion(event)}>
                      <strong>Create discussion</strong>
                      <label className="admin-field admin-field-compact"><span>Scope</span><select value={discussionForm.scope} onChange={(event) => setDiscussionForm((current) => ({ ...current, scope: event.target.value }))}><option value="institution">institution</option><option value="class">class</option>{workspace?.viewer.can_access_public_topics ? <option value="public_topic">public_topic</option> : null}</select></label>
                      <label className="admin-field admin-field-compact"><span>Class</span><select value={discussionForm.class_id} onChange={(event) => setDiscussionForm((current) => ({ ...current, class_id: event.target.value }))}>{selectedClasses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                      <label className="admin-field admin-field-compact"><span>Module ID</span><input value={discussionForm.module_id} onChange={(event) => setDiscussionForm((current) => ({ ...current, module_id: event.target.value }))} placeholder="M3" /></label>
                      <label className="admin-field admin-field-compact"><span>Title</span><input value={discussionForm.title} onChange={(event) => setDiscussionForm((current) => ({ ...current, title: event.target.value }))} /></label>
                      <label className="admin-field admin-field-compact"><span>Body</span><textarea value={discussionForm.body} onChange={(event) => setDiscussionForm((current) => ({ ...current, body: event.target.value }))} rows={4} /></label>
                      <button className="admin-btn admin-btn-primary" disabled={busy === "discussion"} type="submit">{busy === "discussion" ? "Posting..." : "Post discussion"}</button>
                    </form>
                  ) : null}
                </div>
              </section>

              <section className="admin-card">
                <div className="admin-section-header admin-section-header-compact">
                  <div>
                    <p className="admin-kicker">Class delivery</p>
                    <h2 className="admin-section-subtitle">Classes, assignments, and grading queue</h2>
                  </div>
                </div>
                <div className="admin-panel-grid" style={{ marginTop: "1rem" }}>
                  <div className="admin-subpanel">
                    <strong>Classes</strong>
                    <div className="admin-step-list" style={{ marginTop: "0.8rem" }}>
                      {selectedClasses.map((item) => (
                        <article className="admin-step-card" key={item.id}>
                          <h4>{item.name}</h4>
                          <p>{item.term || "Current term"} | {item.student_count} students | {item.teacher_names.join(", ") || "Teacher to assign"}</p>
                          <p>{item.assignments.length} assignments | {item.pending_grading_count} pending grading | Join code {item.join_code || "n/a"}</p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="admin-subpanel">
                    <strong>Recent assignments</strong>
                    <div className="admin-step-list" style={{ marginTop: "0.8rem" }}>
                      {selectedBlock.recent_assignments.map((item) => (
                        <article className="admin-step-card" key={item.id}>
                          <h4>{item.title}</h4>
                          <p>{item.class_name} | {item.assignment_type} | {item.resource_module_ids.join(", ") || "custom task"}</p>
                          <p>{item.due_utc || "No due date"} | {item.grading_mode}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedBlock.permissions.can_grade_submissions ? (
                  <form className="admin-subpanel" onSubmit={(event) => void gradeSubmission(event)} style={{ marginTop: "1rem" }}>
                    <strong>Grade submission</strong>
                    <label className="admin-field admin-field-compact"><span>Submission</span><select value={gradeForm.submission_id} onChange={(event) => setGradeForm((current) => ({ ...current, submission_id: event.target.value }))}>{selectedBlock.recent_submissions.map((item) => <option key={item.id} value={item.id}>{item.assignment_title} | {item.student_email || item.id}</option>)}</select></label>
                    <label className="admin-field admin-field-compact"><span>Score</span><input value={gradeForm.score} onChange={(event) => setGradeForm((current) => ({ ...current, score: event.target.value }))} /></label>
                    <label className="admin-field admin-field-compact"><span>Feedback</span><textarea value={gradeForm.feedback} onChange={(event) => setGradeForm((current) => ({ ...current, feedback: event.target.value }))} rows={3} /></label>
                    <button className="admin-btn admin-btn-primary" disabled={busy === "grade"} type="submit">{busy === "grade" ? "Saving..." : "Return feedback"}</button>
                  </form>
                ) : null}
              </section>
            </>
          ) : (
            <section className="admin-card">
              <h2 className="admin-section-subtitle">No institution memberships yet</h2>
              <p className="admin-section-copy">This account can reach the institutional workspace, but no school memberships are attached yet.</p>
            </section>
          )}
        </div>

        <aside className="admin-side-column">
          <section className="admin-card">
            <p className="admin-kicker">Public topics</p>
            <h3 className="admin-section-subtitle">Cross-platform community</h3>
            <div className="admin-step-list" style={{ marginTop: "0.8rem" }}>
              {(workspace?.public_topic_discussions || []).map((item) => (
                <article className="admin-step-card" key={item.id}>
                  <h4>{item.title}</h4>
                  <p>{item.module_id || "General topic"}</p>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          {selectedBlock ? (
            <section className="admin-card">
              <p className="admin-kicker">Roster snapshot</p>
              <h3 className="admin-section-subtitle">Institution roles in scope</h3>
              <ul className="admin-bullet-list" style={{ marginTop: "0.8rem", paddingLeft: "1.1rem" }}>
                <li>{selectedBlock.members.institution_admins.length} institution admins</li>
                <li>{selectedBlock.members.teachers.length} teachers</li>
                <li>{selectedBlock.members.students.length} students</li>
                <li>{selectedBlock.discussions.length} school/class discussions</li>
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
