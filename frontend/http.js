export const sleep = ms => new Promise(r => setTimeout(r, ms));

export const backoff = (base, attempt, jitter) =>
  base * 2 ** attempt + (jitter ? Math.random() * 100 : 0);

export async function fetchWithResilience(
  url,
  {
    method = "GET",
    body,
    retry = {},
    idempotencyKey,
    requestId
  } = {}
) {
  const {
    retries = 2,
    baseDelayMs = 300,
    timeoutMs = 3000,
    jitter = true
  } = retry;

  const headers = {
    "Content-Type": "application/json",
    "X-Request-Id": requestId ?? crypto.randomUUID()
  };

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      body,
      headers,
      signal: controller.signal
    });

    if (res.status === 429 && retries > 0) {
      const ra = Number(res.headers.get("Retry-After") || 1) * 1000;
      await sleep(ra);
      return fetchWithResilience(url, {
        method,
        body,
        retry: { ...retry, retries: retries - 1 },
        idempotencyKey
      });
    }

    if ([500, 502, 503, 504].includes(res.status) && retries > 0) {
      const attempt = retry.__a ?? 0;
      await sleep(backoff(baseDelayMs, attempt, jitter));
      return fetchWithResilience(url, {
        method,
        body,
        retry: { ...retry, retries: retries - 1, __a: attempt + 1 },
        idempotencyKey
      });
    }

    return res;
  } catch (e) {
    if (retries > 0) {
      const attempt = retry.__a ?? 0;
      await sleep(backoff(baseDelayMs, attempt, jitter));
      return fetchWithResilience(url, {
        method,
        body,
        retry: { ...retry, retries: retries - 1, __a: attempt + 1 },
        idempotencyKey
      });
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

