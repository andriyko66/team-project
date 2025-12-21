let failures = 0;
const MAX_FAILURES = 3;

export function recordFailure() {
  failures++;
  if (failures >= MAX_FAILURES) {
    console.log("⚠️ SYSTEM DEGRADED: overloaded");
  }
}

export function resetFailures() {
  failures = 0;
}
