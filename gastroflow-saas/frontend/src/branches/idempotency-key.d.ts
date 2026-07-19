export function shouldKeepIdempotencyKey(error: unknown): boolean;
export function createIdempotencyKeyController(generate: () => string): {
  getOrCreate(): string;
  onError(error: unknown): void;
  onSuccess(): void;
  cancel(): void;
  peek(): string | null;
};
