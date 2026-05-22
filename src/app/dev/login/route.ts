import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { searchParams, origin } = new URL(request.url);
  const email = searchParams.get("email");
  const next = searchParams.get("next") ?? "/";

  if (!email) {
    return NextResponse.json(
      {
        error: "missing email",
        usage: "/dev/login?email=tu@email.com&next=/pools",
      },
      { status: 400 }
    );
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      {
        error: "SUPABASE_SERVICE_ROLE_KEY no está en .env.local",
        hint: "Dashboard → Project Settings → API → service_role",
      },
      { status: 500 }
    );
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const callback = new URL(`${origin}/auth/callback`);
  if (next.startsWith("/")) {
    callback.searchParams.set("next", next);
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: callback.toString() },
  });

  if (error || !data.properties?.action_link) {
    return NextResponse.json(
      {
        error: error?.message ?? "no action_link returned",
        code: error?.code,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.properties.action_link);
}
