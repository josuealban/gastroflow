import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiClient } from '../api/client';

export interface Branch { id: string; name: string; code: string; city: string | null; isPrimary: boolean; status: string; roles: string[] }
export interface User { id: string; name: string; email: string; restaurantId: string; restaurantName: string; branchId: string | null; roles: string[]; permissions: string[] }
interface AuthResponse { accessToken: string; expiresIn: number; user: User; availableBranches: Branch[] }
interface AuthState {
  user: User | null; branches: Branch[]; ready: boolean;
  login: (value: { restaurantSlug: string; email: string; password: string }) => Promise<void>;
  selectBranch: (id: string) => Promise<void>; changeBranch: () => void;
  logout: () => Promise<void>; refresh: () => Promise<boolean>;
}
const Context = createContext<AuthState | null>(null);
let memoryToken: string | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [ready, setReady] = useState(false);
  const apply = (response: AuthResponse) => { memoryToken = response.accessToken; setUser(response.user); setBranches(response.availableBranches); };
  const refresh = useCallback(async () => { try { apply((await apiClient.post<AuthResponse>('/auth/refresh')).data); return true; } catch { memoryToken = null; setUser(null); return false; } }, []);
  useEffect(() => { void refresh().finally(() => setReady(true)); }, [refresh]);
  useEffect(() => { const id = apiClient.interceptors.request.use((request) => { if (memoryToken) request.headers.Authorization = `Bearer ${memoryToken}`; return request; }); return () => apiClient.interceptors.request.eject(id); }, []);
  useEffect(() => {
    const id = apiClient.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        const candidate = error as { response?: { status?: number }; config?: { url?: string; _authRetried?: boolean } };
        const request = candidate.config;
        if (candidate.response?.status === 401 && request && !request._authRetried && !request.url?.includes('/auth/')) {
          request._authRetried = true;
          if (await refresh()) return apiClient(request);
        }
        throw error;
      },
    );
    return () => apiClient.interceptors.response.eject(id);
  }, [refresh]);
  const value = useMemo<AuthState>(() => ({
    user, branches, ready, refresh,
    login: async (credentials) => apply((await apiClient.post<AuthResponse>('/auth/login', credentials)).data),
    selectBranch: async (id) => apply((await apiClient.post<AuthResponse>('/session/branch', { branchId: id })).data),
    changeBranch: () => setUser((current) => current ? { ...current, branchId: null } : current),
    logout: async () => { await apiClient.post('/auth/logout').catch(() => undefined); memoryToken = null; setUser(null); setBranches([]); },
  }), [user, branches, ready, refresh]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('AuthProvider missing'); return value; }
