import type { CSSProperties } from "react";

// Shared between /login, /signup, /forgot-password, /reset-password — all
// are single-card forms rendered inside <AuthShell>, styled to match the
// rest of the app's design tokens instead of the previous unstyled,
// borderless <input> markup with no focus states or labels.
export const authFormStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

export const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

export const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--color-text-muted)",
};

export const inputStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface)",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  width: "100%",
};

export const errorBoxStyle: CSSProperties = {
  fontSize: 13,
  color: "#f4a3a3",
  backgroundColor: "rgba(227, 93, 93, 0.1)",
  border: "1px solid rgba(227, 93, 93, 0.25)",
  borderRadius: 10,
  padding: "10px 12px",
};

export const successBoxStyle: CSSProperties = {
  fontSize: 13,
  color: "#7fd8b8",
  backgroundColor: "rgba(45, 212, 191, 0.1)",
  border: "1px solid rgba(45, 212, 191, 0.25)",
  borderRadius: 10,
  padding: "10px 12px",
};

export const linkStyle: CSSProperties = {
  color: "var(--color-accent)",
  textDecoration: "none",
};

export const dividerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  margin: "18px 0",
};

export const dividerLineStyle: CSSProperties = {
  flex: 1,
  height: 1,
  backgroundColor: "var(--color-border)",
};

export const dividerTextStyle: CSSProperties = {
  fontSize: 12,
  color: "var(--color-text-muted)",
};

export const footerTextStyle: CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.5)",
  marginTop: 20,
  textAlign: "center",
};
