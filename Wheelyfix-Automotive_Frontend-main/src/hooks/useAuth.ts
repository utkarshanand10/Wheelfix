import { useAuth as useAuthFromContext } from '@/contexts/AuthContext';
import type { User } from '@/services/authService';

export type { User };

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const ctx = useAuthFromContext();

  const wrappedLogin: UseAuthReturn['login'] = async (email, password) => {
    try {
      await ctx.login(email, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  };

  const wrappedRegister: UseAuthReturn['register'] = async (userData) => {
    try {
      await ctx.register(userData.name, userData.email, userData.password);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Registration failed' };
    }
  };

  const signOut = async () => {
    await ctx.logout();
  };

  return {
    user: ctx.user,
    loading: ctx.loading,
    error: ctx.error,
    isAuthenticated: !!ctx.user,
    isAdmin: ctx.user?.role === 'admin',
    login: wrappedLogin,
    register: wrappedRegister,
    logout: ctx.logout,
    signOut,
  };
}

