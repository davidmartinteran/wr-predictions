"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Link2, Check } from "lucide-react";
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
  defaultDisplayName: string;
};

export function NewPoolForm({ tournaments, defaultDisplayName }: Props) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState(defaultDisplayName);
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
        display_name: displayName,
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
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">¡Porra creada!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparte el enlace con tu grupo para que se unan.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Enlace de invitación</div>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="flex-1 rounded-md border border-zinc-800/80 bg-zinc-950 px-3 py-2 text-sm truncate">
              {typeof window !== "undefined"
                ? `${window.location.origin}/join/${created.invite_code}`
                : `/join/${created.invite_code}`}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const url = `${window.location.origin}/join/${created.invite_code}`;
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? "¡Copiado!" : "Copiar enlace"}
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
        <label htmlFor="display_name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Tu nombre en la porra
        </label>
        <Input
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          minLength={2}
          maxLength={40}
          className="mt-2 h-11 bg-zinc-950 border-zinc-800/80"
        />
      </div>

      <div>
        <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Nombre de la porra
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
