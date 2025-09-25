"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./InputBase.module.css";

export interface InputBaseProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  leftAddon?: React.ReactNode; // null -> отключить
  rightAddon?: React.ReactNode;
  autoFocus?: boolean;
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "ghost";
  clearable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  showUnderline?: boolean;
  debounceMs?: number; // если указан - замедляем выдачу onChange
}

export const InputBase: React.FC<InputBaseProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
  inputClassName,
  leftAddon,
  rightAddon,
  autoFocus,
  ariaLabel,
  size = "md",
  variant = "default",
  clearable = true,
  loading = false,
  disabled = false,
  showUnderline = true,
  debounceMs,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [local, setLocal] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSubmit) onSubmit();
    },
    [onSubmit]
  );

  const renderLeft = leftAddon === null ? null : leftAddon;
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rootCls = [
    styles.root,
    renderLeft && styles.withAddon,
    size === "sm" && styles["size-sm"],
    size === "lg" && styles["size-lg"],
    variant !== "default" && styles[`variant-${variant}`],
    focused && styles.focused,
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const inputCls = [styles.input, inputClassName || ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootCls}>
      {renderLeft && <div className={styles.addon}>{renderLeft}</div>}
      <div className={styles.inner}>
        <input
          ref={inputRef}
          value={local}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(e) => {
            const val = e.target.value;
            setLocal(val);
            if (!debounceMs) {
              onChange(val);
              return;
            }
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => onChange(val), debounceMs);
          }}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={inputCls}
          autoFocus={autoFocus}
          disabled={disabled}
        />
        {showUnderline && <span className={styles.underline} />}
        <div className={styles.rightArea}>
          {loading && <span className={styles.spinner} />}
          {clearable && !loading && local && !disabled && (
            <button
              type="button"
              className={styles.clearBtn}
              aria-label="Очистить"
              onClick={() => {
                setLocal("");
                onChange("");
                inputRef.current?.focus();
              }}
            >
              ✕
            </button>
          )}
          {rightAddon}
        </div>
      </div>
    </div>
  );
};

export default InputBase;
