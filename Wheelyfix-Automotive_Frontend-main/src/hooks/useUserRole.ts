import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    setRole(user.role === 'admin' ? 'admin' : 'user');
    setLoading(false);
  }, [user]);

  return { role, loading, isAdmin: role === 'admin' };
};