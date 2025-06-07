import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '../query-client'

interface QueryProviderProps {
  children: React.ReactNode
  showDevtools?: boolean
}

/**
 * Query Provider component that wraps the app with TanStack Query
 * Provides server state management and caching capabilities
 */
export function QueryProvider({ children, showDevtools = true }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  )
}