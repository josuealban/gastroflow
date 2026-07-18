const MAX_PORT = 65_535;
const MAX_TIMEOUT_MS = 60_000;

export function parsePort(
  value: string | undefined,
  fallback: number,
  variableName = 'PORT',
): number {
  const port = Number(value ?? fallback);

  if (!Number.isInteger(port) || port <= 0 || port > MAX_PORT) {
    throw new Error(
      `${variableName} debe ser un puerto entero entre 1 y ${MAX_PORT}`,
    );
  }

  return port;
}

export function parseHost(
  value: string | undefined,
  fallback: string,
  variableName: string,
): string {
  const host = (value ?? fallback).trim();

  if (!host || !/^[a-zA-Z0-9.:[\]-]+$/.test(host)) {
    throw new Error(`${variableName} contiene un host inválido`);
  }

  return host;
}

export function parseTimeout(
  value: string | undefined,
  fallback: number,
): number {
  const timeoutMs = Number(value ?? fallback);

  if (
    !Number.isInteger(timeoutMs) ||
    timeoutMs <= 0 ||
    timeoutMs > MAX_TIMEOUT_MS
  ) {
    throw new Error(
      `MICROSERVICE_TIMEOUT_MS debe ser un entero entre 1 y ${MAX_TIMEOUT_MS}`,
    );
  }

  return timeoutMs;
}

export function parseCorsOrigins(
  value: string | undefined,
  fallback: string,
): string[] {
  const origins = (value ?? fallback)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error('CORS_ORIGIN debe contener al menos un origen');
  }

  for (const origin of origins) {
    let parsed: URL;

    try {
      parsed = new URL(origin);
    } catch {
      throw new Error('CORS_ORIGIN contiene un origen inválido');
    }

    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash
    ) {
      throw new Error('CORS_ORIGIN sólo acepta orígenes HTTP(S) sin ruta');
    }
  }

  return origins;
}

export function parseDurationMs(value: string, variableName: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());
  if (!match)
    throw new Error(`${variableName} debe usar un formato como 15m, 1h o 7d`);
  const factors = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;
  const result = Number(match[1]) * factors[match[2] as keyof typeof factors];
  if (!Number.isSafeInteger(result) || result <= 0)
    throw new Error(`${variableName} contiene una duración inválida`);
  return result;
}
