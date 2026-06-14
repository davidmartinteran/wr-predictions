export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function isPushDenied(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "denied"
  );
}

export function isPushGranted(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.ready;

  const appServerKey = urlBase64ToUint8Array(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  );
  const appServerKeyB64 = btoa(String.fromCharCode(...appServerKey));

  // Si ya existe una suscripcion con OTRA clave (rotacion de VAPID), hay que
  // eliminarla antes de re-suscribir o el navegador lanza InvalidStateError.
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    const existingKey = existing.options.applicationServerKey;
    const sameKey =
      existingKey != null &&
      btoa(String.fromCharCode(...new Uint8Array(existingKey))) ===
        appServerKeyB64;
    if (sameKey) return existing;
    await existing.unsubscribe();
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: appServerKey as BufferSource,
  });

  return subscription;
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export function extractSubscriptionData(sub: PushSubscription) {
  const p256dh = sub.getKey("p256dh");
  const auth = sub.getKey("auth");
  if (!p256dh || !auth) return null;

  return {
    endpoint: sub.endpoint,
    keys_p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
    keys_auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
  };
}
