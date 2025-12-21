import { fetchWithResilience } from "./http.js";
import { recordFailure, resetFailures } from "./degraded.js";

async function createOrder() {
  const payload = { title: "Milk" };
  const key = crypto.randomUUID();

  try {
    const res = await fetchWithResilience(
      "http://localhost:8081/orders",
      {
        method: "POST",
        body: JSON.stringify(payload),
        idempotencyKey: key,
        retry: { retries: 2, baseDelayMs: 300, timeoutMs: 3500 }
      }
    );

    const data = await res.json();
    console.log("✅ ORDER:", data);
    resetFailures();
  } catch {
    recordFailure();
  }
}

createOrder();
