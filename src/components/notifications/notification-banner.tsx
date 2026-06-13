"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, X } from "lucide-react";
import {
  isPushSupported,
  isPushDenied,
  isPushGranted,
  subscribeToPush,
  extractSubscriptionData,
} from "@/lib/push/subscribe";
import { saveSubscription } from "@/lib/push/actions";

const DISMISSED_KEY = "notification-banner-dismissed";

export function NotificationBanner() {
  const [visible, setVisible] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isPushSupported()) return;
    if (isPushGranted()) return;
    if (isPushDenied()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  async function activate() {
    const sub = await subscribeToPush();
    if (!sub) {
      dismiss();
      return;
    }
    const data = extractSubscriptionData(sub);
    if (data) {
      startTransition(async () => {
        await saveSubscription(data);
      });
    }
    dismiss();
  }

  return (
    <div className="mx-4 mb-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 flex items-center gap-3 lg:mx-6">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Bell className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-zinc-200 font-medium">
          Activa las notificaciones
        </p>
        <p className="text-[11px] text-zinc-500">
          Te avisamos 15 min antes de tus partidos favoritos
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={activate}
          className="h-8 px-3.5 rounded-lg text-[12px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
        >
          Activar
        </button>
        <button
          onClick={dismiss}
          className="text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
