"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length < 4) return;
    startTransition(() => {
      router.push(`/join/${encodeURIComponent(trimmed)}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Código (ej. a1b2c3d4)"
        required
        minLength={4}
        maxLength={32}
        className="h-11 bg-zinc-950 border-zinc-800/80 font-mono"
        autoComplete="off"
        autoCapitalize="off"
      />
      <Button type="submit" disabled={isPending || code.trim().length < 4} className="h-11">
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
