"use client";

import { useEffect } from "react";
import { getExistingSubscription, extractSubscriptionData } from "@/lib/push/subscribe";
import { saveSubscription } from "@/lib/push/actions";

export function SWRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then(async () => {
      const sub = await getExistingSubscription();
      if (!sub) return;
      const data = extractSubscriptionData(sub);
      if (data) {
        await saveSubscription(data);
      }
    });
  }, []);

  return null;
}
