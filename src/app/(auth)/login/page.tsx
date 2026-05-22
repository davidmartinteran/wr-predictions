import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params = await searchParams;

  if (user) {
    redirect(params.next?.startsWith("/") ? params.next : "/");
  }

  let invitePool: { name: string; participant_count: number } | null = null;
  const match = params.next?.match(/^\/join\/([^/?#]+)/);
  if (match) {
    const { data } = await supabase
      .rpc("pool_lookup_by_invite_code", { p_code: match[1] })
      .maybeSingle();
    if (data) {
      invitePool = {
        name: data.name,
        participant_count: Number(data.participant_count),
      };
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px] md:rounded-xl md:border md:border-zinc-800/80 md:bg-zinc-900/40 md:p-10">
        <LoginForm next={params.next} invitePool={invitePool} />
        {params.error === "auth" && (
          <p className="mt-4 text-center text-sm text-destructive">
            El enlace ha expirado o no es válido. Solicita uno nuevo.
          </p>
        )}
        <p className="mt-8 text-center text-xs text-muted-foreground/60">
          Al continuar aceptas las{" "}
          <span className="underline underline-offset-2">
            reglas de la porra
          </span>
        </p>
      </div>
    </main>
  );
}
