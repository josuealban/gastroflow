export class BranchDatabaseError extends Error {
  constructor(
    readonly code:
      | 'BRANCH_RESOLUTION_TIMEOUT'
      | 'INVALID_BRANCH_CONNECTION'
      | 'BRANCH_CONNECTION_FAILED',
    message: string,
  ) {
    super(message);
    this.name = 'BranchDatabaseError';
  }
}
