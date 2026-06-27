import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Recuerda la última porra visitada para resaltarla en "Mis porras".
  const match = request.nextUrl.pathname.match(/^\/pools\/([^/]+)(?:\/|$)/);
  if (match && match[1] !== "new") {
    response.cookies.set("current_pool", match[1], {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js).*)",
  ],
};
