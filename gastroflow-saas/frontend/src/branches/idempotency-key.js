export function shouldKeepIdempotencyKey(error) {
  const response = error && typeof error === 'object' ? error.response : undefined;
  if (!response) return true;
  const status = Number(response.status);
  return status === 408 || status === 425 || (status >= 500 && status <= 599);
}

export function createIdempotencyKeyController(generate) {
  let key = null;
  return {
    getOrCreate() { key ??= generate(); return key; },
    onError(error) { if (!shouldKeepIdempotencyKey(error)) key = null; },
    onSuccess() { key = null; },
    cancel() { key = null; },
    peek() { return key; },
  };
}
