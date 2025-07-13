# Creda Network Frontend API Structure Guide

## Overview
This guide outlines the standardized structure for implementing API calls in the Creda Network frontend using TanStack Query (React Query). This pattern ensures consistency across all data fetching and mutations.

---

## Folder Structure

```
src/
├── hooks/
│   ├── credit/
│   │   ├── useCreditApplication.ts
│   │   ├── useCreditStatus.ts
│   │   └── useAcceptCredit.ts
│   ├── social/
│   │   ├── useConnections.ts
│   │   ├── useSendInvite.ts
│   │   └── useVouchUser.ts
│   ├── verification/
│   │   ├── useSendOTP.ts
│   │   └── useVerifyOTP.ts
│   └── research/
│       ├── useUserResearch.ts
│       └── useTriggerResearch.ts
├── queries/
│   ├── credit/
│   │   ├── creditQueries.ts
│   │   └── creditMutations.ts
│   ├── social/
│   │   ├── socialQueries.ts
│   │   └── socialMutations.ts
│   ├── verification/
│   │   └── verificationMutations.ts
│   └── research/
│       ├── researchQueries.ts
│       └── researchMutations.ts
├── api/
│   ├── credit/
│   │   └── creditApi.ts
│   ├── social/
│   │   └── socialApi.ts
│   ├── verification/
│   │   └── verificationApi.ts
│   ├── research/
│   │   └── researchApi.ts
│   └── client.ts
└── types/
    ├── credit.types.ts
    ├── social.types.ts
    ├── verification.types.ts
    └── research.types.ts
```

---

## Implementation Examples

### 1. API Client Setup

**`src/api/client.ts`**
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('crossmint_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
    }
    return Promise.reject(error);
  }
);
```

### 2. API Layer

**`src/api/credit/creditApi.ts`**
```typescript
import { apiClient } from '../client';
import { 
  CreditApplication, 
  CreditApplicationRequest, 
  CreditStatus, 
  AcceptCreditRequest 
} from '@/types/credit.types';

export const creditApi = {
  // Submit credit application
  apply: async (data: CreditApplicationRequest): Promise<CreditApplication> => {
    const response = await apiClient.post('/credit/apply', data);
    return response.data;
  },

  // Check application status
  getStatus: async (applicationId: string): Promise<CreditStatus> => {
    const response = await apiClient.get(`/credit/status/${applicationId}`);
    return response.data;
  },

  // Accept credit offer
  acceptOffer: async (data: AcceptCreditRequest): Promise<any> => {
    const response = await apiClient.post('/credit/decision', data);
    return response.data;
  },
};
```

### 3. Query Layer

**`src/queries/credit/creditQueries.ts`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { creditApi } from '@/api/credit/creditApi';
import { CreditStatus } from '@/types/credit.types';

// Query keys factory
export const creditKeys = {
  all: ['credit'] as const,
  status: (id: string) => [...creditKeys.all, 'status', id] as const,
};

// Query function for credit status
export const useCreditStatusQuery = (applicationId: string | null) => {
  return useQuery<CreditStatus>({
    queryKey: creditKeys.status(applicationId || ''),
    queryFn: () => creditApi.getStatus(applicationId!),
    enabled: !!applicationId,
    refetchInterval: (data) => {
      // Poll every 5 seconds while processing
      return data?.status === 'processing' ? 5000 : false;
    },
  });
};
```

**`src/queries/credit/creditMutations.ts`**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditApi } from '@/api/credit/creditApi';
import { CreditApplicationRequest, AcceptCreditRequest } from '@/types/credit.types';
import { toast } from 'sonner';

// Mutation for submitting credit application
export const useCreditApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreditApplicationRequest) => creditApi.apply(data),
    onSuccess: (data) => {
      toast.success('Credit application submitted successfully');
      // Store application ID for status checking
      localStorage.setItem('current_application_id', data.application_id);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to submit application');
    },
  });
};

// Mutation for accepting credit offer
export const useAcceptCreditMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AcceptCreditRequest) => creditApi.acceptOffer(data),
    onSuccess: (data, variables) => {
      toast.success('Credit offer accepted!');
      // Invalidate status query to refresh
      queryClient.invalidateQueries({
        queryKey: creditKeys.status(variables.application_id),
      });
    },
  });
};
```

### 4. Hook Layer

**`src/hooks/credit/useCreditApplication.ts`**
```typescript
import { useCreditApplicationMutation } from '@/queries/credit/creditMutations';
import { CreditApplicationRequest } from '@/types/credit.types';
import { useRouter } from 'next/navigation';

export const useCreditApplication = () => {
  const router = useRouter();
  const mutation = useCreditApplicationMutation();

  const submitApplication = async (data: CreditApplicationRequest) => {
    try {
      const result = await mutation.mutateAsync(data);
      // Navigate to status page
      router.push(`/credit/status/${result.application_id}`);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  return {
    submitApplication,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
```

**`src/hooks/credit/useCreditStatus.ts`**
```typescript
import { useCreditStatusQuery } from '@/queries/credit/creditQueries';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useCreditStatus = (applicationId: string | null) => {
  const { data, isLoading, error } = useCreditStatusQuery(applicationId);

  // Handle status changes
  useEffect(() => {
    if (data?.status === 'approved') {
      toast.success('Your credit application has been approved!');
    } else if (data?.status === 'not_approved') {
      toast.info('Your application needs more information');
    }
  }, [data?.status]);

  return {
    status: data,
    isLoading,
    error,
    isProcessing: data?.status === 'processing',
    isApproved: data?.status === 'approved',
  };
};
```

### 5. Usage in Components

**`src/components/CreditApplicationForm.tsx`**
```tsx
import { useCreditApplication } from '@/hooks/credit/useCreditApplication';
import { CreditApplicationRequest } from '@/types/credit.types';

export const CreditApplicationForm = () => {
  const { submitApplication, isLoading } = useCreditApplication();

  const handleSubmit = async (values: CreditApplicationRequest) => {
    await submitApplication(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Apply for Credit'}
      </button>
    </form>
  );
};
```

**`src/components/CreditStatusDisplay.tsx`**
```tsx
import { useCreditStatus } from '@/hooks/credit/useCreditStatus';

export const CreditStatusDisplay = ({ applicationId }: { applicationId: string }) => {
  const { status, isLoading, isProcessing, isApproved } = useCreditStatus(applicationId);

  if (isLoading) return <div>Loading...</div>;

  if (isProcessing) {
    return (
      <div>
        <h2>Processing your application...</h2>
        <ProgressIndicator progress={status?.progress} />
      </div>
    );
  }

  if (isApproved) {
    return (
      <CreditOfferCard 
        creditLine={status?.credit_line}
        onAccept={() => {/* handle accept */}}
      />
    );
  }

  return <div>Application status: {status?.status}</div>;
};
```

---

## Type Definitions

**`src/types/credit.types.ts`**
```typescript
export interface CreditApplicationRequest {
  requested_amount: number;
  work_email: string;
  job_title: string;
  monthly_income: number;
  purpose: string;
  social_media: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface CreditApplication {
  application_id: string;
  status: 'processing' | 'approved' | 'not_approved';
  message: string;
  estimated_completion: string;
}

export interface CreditStatus {
  application_id: string;
  status: 'processing' | 'approved' | 'not_approved';
  progress?: {
    employment_verification: 'pending' | 'in_progress' | 'completed';
    social_analysis: 'pending' | 'in_progress' | 'completed';
    behavioral_scoring: 'pending' | 'in_progress' | 'completed';
  };
  credit_line?: {
    amount: number;
    interest_rate: number;
    term_days: number;
    tier: 'premium' | 'standard' | 'starter';
  };
  suggestions?: string[];
}

export interface AcceptCreditRequest {
  application_id: string;
  accept: boolean;
}
```

---

## Best Practices

### 1. Query Key Management
- Use query key factories for consistent key generation
- Include all dependencies in query keys
- Use hierarchical key structure for easy invalidation

### 2. Error Handling
- Handle errors at the query/mutation level
- Provide user-friendly error messages
- Implement retry logic for transient failures

### 3. Loading States
- Use Suspense boundaries where appropriate
- Show skeleton loaders for better UX
- Handle all loading states (initial, refetching, background)

### 4. Cache Management
```typescript
// Invalidate related queries after mutations
queryClient.invalidateQueries({ queryKey: creditKeys.all });

// Optimistic updates for instant feedback
queryClient.setQueryData(creditKeys.status(id), (old) => ({
  ...old,
  status: 'processing',
}));
```

### 5. Type Safety
- Define all API types in the types folder
- Use TypeScript generics with React Query
- Validate API responses with Zod if needed

---

## Testing Strategy

```typescript
// Example test for hook
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreditStatus } from '@/hooks/credit/useCreditStatus';

describe('useCreditStatus', () => {
  it('should fetch credit status', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () => useCreditStatus('app_123'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.status).toBeDefined();
    });
  });
});
```

This structure ensures:
- **Separation of concerns**: API calls, queries, and UI logic are separate
- **Reusability**: Hooks can be used across multiple components
- **Testability**: Each layer can be tested independently
- **Type safety**: Full TypeScript support throughout
- **Consistency**: Same pattern for all API interactions