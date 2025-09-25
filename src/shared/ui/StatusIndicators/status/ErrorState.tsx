"use client";
import React from "react";
import s from "../StatusIndicators.module.css";
export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}
export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div role="alert" className={s.errorWrap}>
    <div style={{ marginBottom: 8 }}>Ошибка: {message}</div>
    {onRetry && (
      <button onClick={onRetry} className={s.errorBtn}>
        Повторить
      </button>
    )}
  </div>
);
export default ErrorState;
