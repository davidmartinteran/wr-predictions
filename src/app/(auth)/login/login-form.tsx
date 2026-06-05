"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { Trophy, Mail, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { sendOtp } from "./actions";

type InvitePool = { name: string; participant_count: number };

type Props = {
  next?: string;
  invitePool?: InvitePool | null;
};

function Header({ invitePool }: { invitePool?: InvitePool | null }) {
  if (invitePool) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Trophy className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Te han invitado a
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {invitePool.name}
          </h1>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {invitePool.participant_count}{" "}
            {invitePool.participant_count === 1 ? "jugador" : "jugadores"}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
        <Trophy className="h-7 w-7 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Porra Mundial 2026</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pronósticos entre amigos
        </p>
      </div>
    </div>
  );
}

export function LoginForm({ next, invitePool }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [countdown, setCountdown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  const handleSendOtp = useCallback(
    (formData: FormData) => {
      setError(null);
      startTransition(async () => {
        const result = await sendOtp(formData);
        if (result.error) {
          setError(result.error);
        } else {
          setEmail(result.email!);
          setStep("otp");
          setCountdown(60);
        }
      });
    },
    []
  );

  const handleVerifyOtp = useCallback(() => {
    if (otp.length !== 8) return;
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (verifyError) {
        setError("Código incorrecto o expirado. Inténtalo de nuevo.");
        setOtp("");
      } else {
        router.push(next ?? "/");
        router.refresh();
      }
    });
  }, [email, otp, next, router]);

  const handleResend = useCallback(() => {
    const fd = new FormData();
    fd.set("email", email);
    setError(null);
    startTransition(async () => {
      const result = await sendOtp(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setCountdown(60);
        setOtp("");
      }
    });
  }, [email]);

  if (step === "otp") {
    return (
      <div className="flex flex-col items-center text-center gap-6">
        <Header invitePool={invitePool} />

        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800">
          <Mail className="h-7 w-7 text-muted-foreground" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Introduce el código</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hemos enviado un código de 8 dígitos a
          </p>
          <p className="mt-0.5 text-sm font-medium">{email}</p>
        </div>

        <div className="w-full space-y-4">
          <Input
            ref={otpRef}
            type="tel"
            inputMode="numeric"
            maxLength={8}
            placeholder="00000000"
            value={otp}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 8);
              setOtp(v);
            }}
            className="h-14 text-center text-2xl font-mono font-bold tracking-[0.3em] bg-zinc-900/40 border-zinc-800/80"
            autoComplete="one-time-code"
          />

          <Button
            onClick={handleVerifyOtp}
            disabled={otp.length !== 8 || isPending}
            className="w-full h-11 md:h-[52px] text-base font-medium"
          >
            {isPending ? "Verificando..." : "Entrar"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>¿No ha llegado?</span>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || isPending}
              className="font-medium underline underline-offset-2 text-foreground disabled:text-muted-foreground disabled:no-underline"
            >
              Reenviar código
            </button>
            {countdown > 0 && (
              <span className="text-muted-foreground/60">· {countdown}s</span>
            )}
          </div>
          <button
            onClick={() => {
              setStep("email");
              setEmail("");
              setOtp("");
              setError(null);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Usar otro email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-8">
      <Header invitePool={invitePool} />

      <form action={handleSendOtp} className="w-full space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
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
          {isPending ? "Enviando..." : "Enviar código"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-sm text-muted-foreground">
          Te enviaremos un código de 6 dígitos para entrar, sin contraseña.
        </p>
      </form>
    </div>
  );
}
