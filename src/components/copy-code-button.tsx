"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  className?: string;
};

export function CopyCodeButton({ code, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [code]
  );

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-2 py-1 transition-colors hover:bg-zinc-700/60",
        className
      )}
    >
      <span className="font-mono text-xs text-zinc-300">{code}</span>
      {copied ? (
        <Check className="h-3 w-3 text-primary" />
      ) : (
        <Copy className="h-3 w-3 text-zinc-500" />
      )}
    </button>
  );
}
