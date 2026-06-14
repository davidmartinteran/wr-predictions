"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { setPoolNotifications } from "@/lib/notifications/actions";

export function AdminNotificationsToggle({
  poolId,
  enabled,
}: {
  poolId: string;
  enabled: boolean;
}) {
  const [on, setOn] = useState(enabled);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const res = await setPoolNotifications({ pool_id: poolId, enabled: next });
      if (res?.error) setOn(!next); // revertir si falla
    });
  }

  return (
    <div className="mx-4 mb-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 flex items-center gap-3 lg:mx-6">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Bell className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-zinc-200 font-medium">
          Notificaciones de la porra
        </p>
        <p className="text-[11px] text-zinc-500">
          {on
            ? "Los miembros reciben avisos de todos los partidos"
            : "Actívalas para que los miembros reciban avisos"}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={pending}
        role="switch"
        aria-checked={on}
        aria-label="Notificaciones de la porra"
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors shrink-0 disabled:opacity-60",
          on ? "bg-primary" : "bg-zinc-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            on ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
