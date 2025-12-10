/**
 * Store Ready Guard utilities
 * Provides HOC and Hook for safely rendering components that depend on persisted store data
 */

import { ComponentType, ReactNode } from 'react';
import { useStoreWithEqualityFn } from 'zustand/traditional';
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
  // Use React hook to subscribe to store updates
  const isReady = useStoreWithEqualityFn(store, selector);

  if (!isReady) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if a store is ready
 * Subscribes to store updates and re-renders when ready state changes.
 *
 * @example
 * ```tsx
 * // Prefer using the store's dedicated hook when available:
 * const ready = useTenantStore((state) => state.ready);
 *
 * // Or use this utility for generic StoreApi instances:
 * const ready = useStoreReady(tenantStore);
 * ```
 */
export function useStoreReady(
  store: StoreApi<StoreWithReady>,
  selector: (state: StoreWithReady) => boolean = (state) => state.ready,
): boolean {
  // Use React hook to subscribe to store updates
  return useStoreWithEqualityFn(store, selector);
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
  selector: (state: StoreWithReady) => boolean = (state) => state.ready,
) {
  return (Component: ComponentType<P>) => {
    const WrappedComponent = (props: P) => {
      // Use React hook to subscribe to store updates
      const isReady = useStoreWithEqualityFn(store, selector);

      if (!isReady) {
        return <>{fallback ? fallback() : null}</>;
      }

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withStoreReady(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
  };
}
