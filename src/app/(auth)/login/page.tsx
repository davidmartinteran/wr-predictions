import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/predictions");
  }

  const params = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px] md:rounded-xl md:border md:border-zinc-800/80 md:bg-zinc-900/40 md:p-10">
        <LoginForm />
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
