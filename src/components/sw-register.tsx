"use client";

import { useEffect } from "react";
import {
  isPushGranted,
  subscribeToPush,
  extractSubscriptionData,
} from "@/lib/push/subscribe";
import { saveSubscription } from "@/lib/push/actions";

export function SWRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then(async () => {
      // Solo si el usuario ya concedio permiso (no provocamos prompt aqui).
      if (!isPushGranted()) return;
      // subscribeToPush re-suscribe si la clave VAPID cambio (rotacion), y
      // devuelve la existente si coincide. Asi se auto-curan las suscripciones
      // creadas con una clave publica antigua.
      const sub = await subscribeToPush();
      if (!sub) return;
      const data = extractSubscriptionData(sub);
      if (data) {
        await saveSubscription(data);
      }
    });
  }, []);

  return null;
}
