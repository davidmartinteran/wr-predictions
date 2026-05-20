"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Trophy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMagicLink } from "./actions";

export function LoginForm() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSubmit = useCallback(
    (formData: FormData) => {
      setError(null);
      startTransition(async () => {
        const result = await sendMagicLink(formData);
        if (result.error) {
          setError(result.error);
        } else {
          setEmail(result.email!);
          setSent(true);
          setCountdown(60);
        }
      });
    },
    []
  );

  const handleResend = useCallback(() => {
    const fd = new FormData();
    fd.set("email", email);
    setError(null);
    startTransition(async () => {
      const result = await sendMagicLink(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setCountdown(60);
      }
    });
  }, [email]);

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Trophy className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Porra Mundial 2026
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pronósticos entre amigos
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800">
          <Mail className="h-7 w-7 text-muted-foreground" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Revisa tu bandeja de entrada
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hemos enviado un enlace a
          </p>
          <p className="mt-0.5 text-sm font-medium">{email}</p>
        </div>

        <div className="w-full rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-4 text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Siguiente paso
          </p>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-muted-foreground/60">1.</span>
              Abre el correo de Porra Mundial
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground/60">2.</span>
              Toca &quot;Entrar a la porra&quot;
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground/60">3.</span>
              Vuelves aquí, ya dentro
            </li>
          </ol>
        </div>

        <div className="flex flex-col items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>¿No ha llegado?</span>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || isPending}
              className="font-medium underline underline-offset-2 text-foreground disabled:text-muted-foreground disabled:no-underline"
            >
              Reenviar enlace
            </button>
            {countdown > 0 && (
              <span className="text-muted-foreground/60">· {countdown}s</span>
            )}
          </div>
          <button
            onClick={() => {
              setSent(false);
              setEmail("");
              setError(null);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Usar otro email
          </button>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Trophy className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Porra Mundial 2026
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pronósticos entre amigos
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="w-full space-y-4">
        <div className="text-left">
          <label
            htmlFor="email"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            autoComplete="email"
            className="mt-2 h-11 md:h-[52px] bg-zinc-900/40 border-zinc-800/80"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 md:h-[52px] text-base font-medium"
        >
          {isPending ? "Enviando..." : "Enviar Magic Link"}
        </Button>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <p className="text-sm text-muted-foreground">
          Te enviaremos un enlace para entrar, sin contraseña.
        </p>
      </form>
    </div>
  );
}
