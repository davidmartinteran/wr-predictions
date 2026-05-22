"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { createPool } from "../actions";

type TournamentOption = {
  id: string;
  name: string;
  starts_at: string;
};

type Props = {
  tournaments: TournamentOption[];
};

export function NewPoolForm({ tournaments }: Props) {
  const [name, setName] = useState("");
  const [tournamentId, setTournamentId] = useState(tournaments[0]?.id ?? "");
  const [deadline, setDeadline] = useState(() => {
    const t = tournaments[0];
    return t ? toLocalInput(t.starts_at) : "";
  });
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; invite_code: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toLocalInput(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const deadlineIso = new Date(deadline).toISOString();
      const res = await createPool({
        name,
        tournament_id: tournamentId,
        deadline: deadlineIso,
      });
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      if (res.success) {
        setCreated({ id: res.id!, invite_code: res.invite_code! });
      }
    });
  }

  if (created) {
    const url = typeof window !== "undefined" ? `${window.location.origin}/join/${created.invite_code}` : "";
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">¡Porra creada!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparte el código o el enlace con tu grupo.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Código</div>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="flex-1 rounded-md border border-zinc-800/80 bg-zinc-950 px-3 py-2 font-mono text-sm">
              {created.invite_code}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(url || created.invite_code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar enlace"}
            </Button>
          </div>
        </div>

        <Link
          href={`/pools/${created.id}/predictions`}
          className={buttonVariants({ className: "w-full justify-center h-11" })}
        >
          Ir a la porra
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Nombre
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Los Amigos"
          required
          minLength={2}
          maxLength={60}
          className="mt-2 h-11 bg-zinc-950 border-zinc-800/80"
        />
      </div>

      <div>
        <label htmlFor="tournament" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Torneo
        </label>
        <select
          id="tournament"
          value={tournamentId}
          onChange={(e) => {
            setTournamentId(e.target.value);
            const t = tournaments.find((x) => x.id === e.target.value);
            if (t) setDeadline(toLocalInput(t.starts_at));
          }}
          className="mt-2 h-11 w-full rounded-md border border-zinc-800/80 bg-zinc-950 px-3 text-sm"
          required
        >
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="deadline" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Cierre de pronósticos
        </label>
        <Input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
          className="mt-2 h-11 bg-zinc-950 border-zinc-800/80"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Después de esta fecha nadie podrá editar pronósticos.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending} className="w-full h-11">
        {isPending ? "Creando..." : "Crear porra"}
      </Button>
    </form>
  );
}
