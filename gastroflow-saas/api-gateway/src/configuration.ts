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
