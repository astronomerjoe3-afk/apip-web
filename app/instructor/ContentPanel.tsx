
import type { ChangeEvent } from "react";

import type { UploadItem } from "./types";

type ContentPanelProps = {
  uploadQueue: UploadItem[];
  uploadSection: string;
  uploadTag: string;
  setUploadSection: (value: string) => void;
  setUploadTag: (value: string) => void;
  handleUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  toggleUploadStatus: (uploadId: string) => void;
  removeUpload: (uploadId: string) => void;
  clearUploads: () => void;
  uploadSummary: Array<[string, number]>;
};

export default function ContentPanel(props: ContentPanelProps) {
  const {
    uploadQueue,
    uploadSection,
    uploadTag,
    setUploadSection,
    setUploadTag,
    handleUpload,
    toggleUploadStatus,
    removeUpload,
    clearUploads,
    uploadSummary,
  } = props;

  return (
    <section className="admin-card">
      <div className="admin-section-header">
        <div>
          <p className="admin-kicker">Easy content upload and organisation</p>
          <h2 className="admin-section-subtitle">Stage the next teaching pack</h2>
          <p className="admin-section-copy">
            Drop lesson assets into a clean staging queue, tag them, and organize them by use before they move into publishing or review.
          </p>
        </div>
        <div className="admin-chip-list">
          <span className="admin-chip">Local staging</span>
          <span className="admin-chip">Section tags</span>
        </div>
      </div>

      <div className="admin-form-grid" style={{ marginTop: "1rem" }}>
        <label className="admin-field">
          <span className="admin-mini-label">Section</span>
          <input value={uploadSection} onChange={(event) => setUploadSection(event.target.value)} />
        </label>
        <label className="admin-field">
          <span className="admin-mini-label">Tag</span>
          <input value={uploadTag} onChange={(event) => setUploadTag(event.target.value)} />
        </label>
        <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
          <span className="admin-mini-label">Upload files</span>
          <input multiple onChange={handleUpload} type="file" />
        </label>
      </div>
      <div className="admin-toolbar admin-toolbar-tight" style={{ marginTop: "1rem" }}>
        {uploadSummary.map(([section, count]) => (
          <span className="admin-chip" key={section}>
            {section}: {count}
          </span>
        ))}
        {uploadQueue.length ? (
          <button className="admin-btn admin-btn-secondary" onClick={clearUploads} type="button">
            Clear queue
          </button>
        ) : null}
      </div>

      {uploadQueue.length ? (
        <div className="admin-stack" style={{ marginTop: "1rem" }}>
          {uploadQueue.map((item) => (
            <article className="admin-subpanel" key={item.id}>
              <div className="admin-section-header admin-section-header-compact">
                <div>
                  <strong>{item.name}</strong>
                  <p className="admin-key-meta">{item.sizeLabel} • {item.section} • {item.tag}</p>
                </div>
                <span className={item.status === "Sorted" ? "admin-badge admin-badge-success" : "admin-badge admin-badge-muted"}>{item.status}</span>
              </div>
              <div className="admin-toolbar admin-toolbar-tight" style={{ marginTop: "0.7rem" }}>
                <button className="admin-btn admin-btn-secondary" onClick={() => toggleUploadStatus(item.id)} type="button">
                  {item.status === "Queued" ? "Mark sorted" : "Move back to queue"}
                </button>
                <button className="admin-btn admin-btn-danger" onClick={() => removeUpload(item.id)} type="button">
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-empty-state" style={{ marginTop: "1rem" }}>
          No staged content yet. Add lesson slides, visuals, notes, or assessment files to start organizing the next release.
        </div>
      )}
    </section>
  );
}
