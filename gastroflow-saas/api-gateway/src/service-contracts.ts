export const CORE_HEALTH_PATTERN = { cmd: 'core.health' } as const;
export const OPERATIONS_HEALTH_PATTERN = {
  cmd: 'operations.health',
} as const;

export interface TcpHealthResponse {
  service: 'core-service' | 'operations-service';
  status: 'ok';
  transport: 'tcp';
  timestamp: string;
}
