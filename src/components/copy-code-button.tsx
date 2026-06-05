"use client";

import { useState, useCallback } from "react";
import { Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  inviteCode: string;
  className?: string;
};

export function CopyCodeButton({ inviteCode, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const url = `${window.location.origin}/join/${inviteCode}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [inviteCode]
  );

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-2 py-1 transition-colors hover:bg-zinc-700/60",
        className
      )}
      title="Copiar enlace"
    >
      <span className="text-xs text-zinc-300">{copied ? "¡Copiado!" : "Compartir"}</span>
      {copied ? (
        <Check className="h-3 w-3 text-primary" />
      ) : (
        <Link2 className="h-3 w-3 text-zinc-500" />
      )}
    </button>
  );
}
