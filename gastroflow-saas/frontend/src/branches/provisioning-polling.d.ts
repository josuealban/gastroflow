export interface ProvisioningProgress {
  branchId: string;
  branchStatus: 'PROVISIONING' | 'ACTIVE' | 'INACTIVE' | 'FAILED';
  jobStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  attempts: number;
  maxAttempts: number;
  errorCode?: string | null;
  errorMessage?: string | null;
}
export function pollBranchProvisioning(options: {
  branchId: string;
  fetchProgress: (branchId: string) => Promise<ProvisioningProgress>;
  onProgress: (progress: ProvisioningProgress) => void;
  onError: (error: unknown) => void;
  maxPolls?: number;
  intervalMs?: number;
  schedule?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
}): () => void;
