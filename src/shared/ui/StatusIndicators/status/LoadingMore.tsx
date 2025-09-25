"use client";
import React from "react";
import s from "../StatusIndicators.module.css";
export const LoadingMore: React.FC = () => (
  <div role="status" aria-live="polite" className={s.loading}>
    Загрузка…
  </div>
);
export default LoadingMore;
