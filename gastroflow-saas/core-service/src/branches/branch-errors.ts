export type BranchResolutionErrorCode =
  | 'INVALID_INTERNAL_TOKEN'
  | 'INVALID_BRANCH_ID'
  | 'BRANCH_NOT_FOUND'
  | 'RESTAURANT_INACTIVE'
  | 'BRANCH_INACTIVE'
  | 'BRANCH_PROVISIONING'
  | 'BRANCH_FAILED'
  | 'SUBSCRIPTION_SUSPENDED'
  | 'SUBSCRIPTION_EXPIRED'
  | 'DATABASE_CREDENTIALS_INVALID';

export class BranchResolutionError extends Error {
  constructor(
    readonly code: BranchResolutionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'BranchResolutionError';
  }
}
