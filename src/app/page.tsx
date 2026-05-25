import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: participations } = await supabase
    .from("participations")
    .select("pool_id, joined_at")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  const pools = participations ?? [];

  if (pools.length === 0) {
    redirect("/pools");
  }

  if (pools.length === 1) {
    redirect(`/pools/${pools[0].pool_id}/predictions`);
  }

  redirect("/pools");
}
