"use client";
import React from "react";
import s from "../StatusIndicators.module.css";
export const EmptyState: React.FC<{ query?: string }> = ({ query }) => (
  <div role="note" className={s.empty}>
    {query ? (
      <>
        Нет результатов для «<strong>{query}</strong>»
      </>
    ) : (
      "Начните вводить для поиска"
    )}
  </div>
);
export default EmptyState;
