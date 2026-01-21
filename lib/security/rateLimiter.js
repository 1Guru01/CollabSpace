const rateMap = new Map();

/**
 * key = email or IP
 * limit = max requests allowed
 * windowMs = reset window
 */
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const record = rateMap.get(key) || { count: 0, expires: now + windowMs };

  if (now > record.expires) {
    // Reset window
    record.count = 0;
    record.expires = now + windowMs;
  }

  record.count++;
  rateMap.set(key, record);

  if (record.count > limit) {
    return false; // blocked
  }

  return true; // allowed
}
