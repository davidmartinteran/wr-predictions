"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { joinPool } from "@/app/(main)/pools/actions";

type Props = {
  inviteCode: string;
  defaultDisplayName: string;
};

export function JoinForm({ inviteCode, defaultDisplayName }: Props) {
  const [name, setName] = useState(defaultDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await joinPool({ invite_code: inviteCode, display_name: name });
      if (res && "error" in res && res.error) {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="display_name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Tu nombre en la porra
        </label>
        <Input
          id="display_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={40}
          className="mt-2 h-11 bg-zinc-950 border-zinc-800/80"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending} className="w-full h-11">
        {isPending ? "Uniéndose..." : "Unirme a la porra"}
      </Button>
    </form>
  );
}
