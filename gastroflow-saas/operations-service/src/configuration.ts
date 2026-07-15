const MAX_PORT = 65_535;

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
