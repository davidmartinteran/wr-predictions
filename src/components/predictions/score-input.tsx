"use client";

import { useCallback } from "react";

type ScoreInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

export function ScoreInput({ value, onChange, disabled }: ScoreInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      if (raw === "") {
        onChange(null);
        return;
      }
      const n = parseInt(raw, 10);
      if (n >= 0 && n <= 15) onChange(n);
    },
    [onChange]
  );

  return (
    <input
      type="tel"
      inputMode="numeric"
      maxLength={2}
      value={value ?? ""}
      onChange={handleChange}
      disabled={disabled}
      placeholder="–"
      className="w-[44px] h-[44px] md:w-[52px] md:h-[52px] rounded-lg bg-zinc-950 border border-zinc-800 text-center text-[22px] md:text-[26px] font-bold tabular-nums text-zinc-50 placeholder:text-zinc-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
    />
  );
}
