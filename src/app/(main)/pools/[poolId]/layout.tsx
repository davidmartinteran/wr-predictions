import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";

export default async function PoolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ poolId: string }>;
}) {
  const { poolId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: participation } = await supabase
    .from("participations")
    .select("pool_id, display_name, is_admin")
    .eq("user_id", user.id)
    .eq("pool_id", poolId)
    .maybeSingle();

  if (!participation) notFound();

  const { data: pool } = await supabase
    .from("pools")
    .select("id, name, tournament_id")
    .eq("id", poolId)
    .maybeSingle();

  if (!pool) notFound();

  const { count: participantCount } = await supabase
    .from("participations")
    .select("user_id", { count: "exact", head: true })
    .eq("pool_id", poolId);

  return (
    <div className="flex flex-col h-dvh">
      <TopBar
        poolId={poolId}
        poolName={pool.name}
        participantCount={participantCount ?? 1}
        displayName={participation.display_name}
      />
      <main className="flex-1 pb-20 lg:pb-0 min-h-0">{children}</main>
      <BottomNav poolId={poolId} />
    </div>
  );
}
