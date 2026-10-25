import type { RequestHandler } from "express";

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const AUTH_LIMIT = 30;

function clientKey(req: Parameters<RequestHandler>[0]) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]?.trim();
  return ip || req.ip || "unknown";
}

export function securityHeaders(): RequestHandler {
  return (_req, res, next) => {
    res.removeHeader("X-Powered-By");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  };
}

export function authRateLimit(): RequestHandler {
  return (req, res, next) => {
    if (!req.path.startsWith("/api/oauth/") && !req.path.startsWith("/api/auth/")) {
      next();
      return;
    }
    const key = clientKey(req);
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      next();
      return;
    }
    current.count += 1;
    if (current.count > AUTH_LIMIT) {
      res.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      res.status(429).json({ error: "too_many_auth_requests" });
      return;
    }
    next();
  };
}

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}, WINDOW_MS);
cleanup.unref();
