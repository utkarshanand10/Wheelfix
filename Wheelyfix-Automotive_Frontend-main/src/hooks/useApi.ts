import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { toast } from '@/components/ui/use-toast';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await apiCall(...args);
        setState({ data, loading: false, error: null });
        
        options.onSuccess?.(data);
        
        if (options.showSuccessToast) {
          toast({
            title: 'Success',
            description: options.successMessage || 'Operation completed successfully',
          });
        }
        
        return { success: true, data };
      } catch (error) {
        const errorMessage = error instanceof AxiosError 
          ? error.response?.data?.message || error.message
          : 'An error occurred';
        
        setState({ data: null, loading: false, error: new Error(errorMessage) });
        options.onError?.(error as Error);
        
        return { success: false, error: errorMessage };
      }
    },
    [apiCall, options]
  );

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null }),
  };
}
