import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

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

  // Create or find user, then generate a session directly
  let userId: string;

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  if (existing) {
    userId = existing.id;
  } else {
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createError || !newUser.user) {
      return NextResponse.json({ error: createError?.message ?? "Failed to create user" }, { status: 500 });
    }
    userId = newUser.user.id;
  }

  // Generate a magic link and extract the token to sign in server-side
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData.properties?.hashed_token) {
    return NextResponse.json({ error: linkError?.message ?? "No token returned" }, { status: 500 });
  }

  // Use the server supabase client to verify the OTP and set the session cookie
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: linkData.properties.hashed_token,
  });

  if (verifyError) {
    return NextResponse.json({ error: verifyError.message, hint: "verifyOtp failed" }, { status: 500 });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
