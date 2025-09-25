"use client";
import React from "react";
import s from "./Loader.module.css";

interface LoaderProps {
  label?: string;
  inline?: boolean;
  size?: number;
}

export const Loader: React.FC<LoaderProps> = ({
  label = "Загрузка",
  inline = false,
  size,
}) => {
  const style: React.CSSProperties | undefined = size
    ? { width: size, height: size }
    : undefined;
  const spinner = (
    <div className={s.spinner} style={style} aria-hidden="true" />
  );
  return inline ? (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      role="status"
      aria-live="polite"
    >
      {spinner}
      <span style={{ fontSize: 12 }}>{label}…</span>
    </span>
  ) : (
    <div className={s.wrap} role="status" aria-live="polite">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {spinner}
        <div className={s.label}>{label}…</div>
      </div>
    </div>
  );
};

export default Loader;
