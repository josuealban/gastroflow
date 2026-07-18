export interface AccessPayload {
  sub: string;
  restaurantId: string;
  branchId: string | null;
  email: string;
  roles: string[];
  permissions: string[];
  tokenType: 'access';
  jti: string;
}
export interface RefreshPayload {
  sub: string;
  restaurantId: string;
  branchId: string | null;
  tokenType: 'refresh';
  jti: string;
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
export interface BranchSummary {
  id: string;
  name: string;
  code: string;
  city: string | null;
  isPrimary: boolean;
  status: string;
  roles: string[];
}
