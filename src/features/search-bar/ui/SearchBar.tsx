"use client";
import React from "react";
import SearchIcon from "@/shared/ui/icons/SearchIcon";
import { InputBase } from "@/shared/ui/InputBase/InputBase";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  autoFocus?: boolean;
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "ghost";
  clearable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  debounceMs?: number;
}

export const SearchBar: React.FC<Props> = ({
  leftAddon,
  placeholder = "Введите запрос",
  debounceMs,
  ...rest
}) => {
  const addon =
    leftAddon === null
      ? null
      : leftAddon ?? <SearchIcon size={18} strokeWidth={2} />;
  return (
    <InputBase
      {...rest}
      placeholder={placeholder}
      leftAddon={addon}
      showUnderline
      debounceMs={debounceMs}
    />
  );
};
