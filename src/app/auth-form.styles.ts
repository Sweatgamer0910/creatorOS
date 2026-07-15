import type { CSSProperties } from "react";

// Shared between /login and /signup — both are single-card forms on a
// centered dark page, styled to match the rest of the app's design tokens
// instead of the previous unstyled/borderless <input> markup.
export const authPageStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

export const authFormStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

export const inputStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface)",
  color: "#fff",
  fontSize: 14,
  outline: "none",
};
