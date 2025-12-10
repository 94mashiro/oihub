/**
 * Store Ready Guard utilities
 * Provides HOC and Hook for safely rendering components that depend on persisted store data
 */

import { ComponentType, ReactNode } from 'react';
import type { StoreApi } from 'zustand/vanilla';

/**
 * Store state that includes a ready flag
 */
export interface StoreWithReady {
  ready: boolean;
}

/**
 * Props for StoreReadyGuard component
 */
export interface StoreReadyGuardProps {
  /** Store instance to check ready state */
  store: StoreApi<StoreWithReady>;
  /** Content to render when store is ready */
  children: ReactNode;
  /** Optional fallback to render while loading */
  fallback?: ReactNode;
  /** Optional selector to get ready state (default: (state) => state.ready) */
  selector?: (state: StoreWithReady) => boolean;
}

/**
 * Component that guards rendering until store is ready
 * Prevents rendering persisted data before hydration completes
 *
 * @example
 * ```tsx
 * <StoreReadyGuard store={tenantStore} fallback={<Spinner />}>
 *   <TenantList />
 * </StoreReadyGuard>
 * ```
 */
export function StoreReadyGuard({
  store,
  children,
  fallback = null,
  selector = (state) => state.ready,
}: StoreReadyGuardProps) {
  const ready = store.getState();
  const isReady = selector(ready);

  if (!isReady) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if a store is ready
 * Note: This is a simple utility. For React components, prefer using the store's
 * dedicated hook (e.g., useTenantStore) with a selector for better reactivity.
 *
 * @example
 * ```tsx
 * // Prefer this:
 * const ready = useTenantStore((state) => state.ready);
 *
 * // Or use this utility for non-React contexts:
 * const ready = useStoreReady(tenantStore);
 * ```
 */
export function useStoreReady(store: StoreApi<StoreWithReady>): boolean {
  // For React components, this should use the store's hook with subscription
  // This is a simple synchronous check - use store hooks in React instead
  const state = store.getState();
  return state.ready;
}

/**
 * HOC that wraps a component and ensures store is ready before rendering
 *
 * @example
 * ```tsx
 * const TenantList = withStoreReady(
 *   tenantStore,
 *   () => <LoadingSpinner />,
 * )(({ tenantId }) => {
 *   // Component only renders when store is ready
 *   const tenant = useTenantStore((state) => ...);
 *   return <div>{tenant.name}</div>;
 * });
 * ```
 */
export function withStoreReady<P extends object>(
  store: StoreApi<StoreWithReady>,
  fallback?: () => ReactNode,
  selector?: (state: StoreWithReady) => boolean,
) {
  return (Component: ComponentType<P>) => {
    const WrappedComponent = (props: P) => {
      const ready = store.getState();
      const isReady = selector ? selector(ready) : ready.ready;

      if (!isReady) {
        return <>{fallback ? fallback() : null}</>;
      }

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withStoreReady(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
  };
}
