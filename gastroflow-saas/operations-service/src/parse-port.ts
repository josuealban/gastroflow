export function parsePort(value: string | undefined, fallback: number): number {
  const port = Number(value ?? fallback);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Puerto inválido: ${value ?? fallback}`);
  }

  return port;
}
