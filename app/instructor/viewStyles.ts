export const barTrackStyle = {
  width: "100%",
  height: "0.7rem",
  borderRadius: "999px",
  background: "rgba(226, 232, 240, 0.9)",
  overflow: "hidden",
} as const;

export const barFillStyle = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(135deg, rgba(20, 88, 201, 0.96) 0%, rgba(39, 120, 221, 0.94) 100%)",
} as const;

export const avatarStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: "999px",
  background: "linear-gradient(145deg, rgba(223, 233, 252, 0.96) 0%, rgba(201, 218, 249, 0.92) 100%)",
  color: "#193255",
  fontWeight: 800,
} as const;

export const avatarLargeStyle = {
  ...avatarStyle,
  width: "3.35rem",
  height: "3.35rem",
  fontSize: "1.05rem",
} as const;

export const selectStyle = {
  width: "100%",
  minHeight: "3rem",
  padding: "0.85rem 1rem",
  borderRadius: "20px",
  border: "1px solid var(--border)",
  background: "rgba(255, 255, 255, 0.95)",
  color: "#243447",
} as const;
