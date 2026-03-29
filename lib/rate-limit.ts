type Entry = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const store = new Map<string, Entry>();

export function getRequestKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const realIp = request.headers.get("x-real-ip") || "";
  return forwardedFor.split(",")[0]?.trim() || realIp || "anonymous";
}

export function checkRateLimit(key: string) {
  // NOTA: este limitador en memoria funciona por instancia.
  // En despliegues serverless o multi-instancia conviene reemplazarlo por Redis u otro store compartido.
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  store.set(key, current);
  return { allowed: true, remaining: MAX_REQUESTS - current.count };
}
