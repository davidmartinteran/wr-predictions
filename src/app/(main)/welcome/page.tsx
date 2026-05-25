import { redirect } from "next/navigation";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;

  if (invite) {
    redirect(`/join/${encodeURIComponent(invite)}`);
  }

  redirect("/pools");
}
