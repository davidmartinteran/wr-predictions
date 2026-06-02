"use client";

import { LogOut } from "lucide-react";
import { signOut } from "./actions";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mx-auto px-5 py-2.5 rounded-lg border border-zinc-800/80 hover:border-zinc-700"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}
