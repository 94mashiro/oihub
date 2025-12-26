/**
 * Platform API Service Contracts
 *
 * TypeScript interfaces defining the contract between business layer
 * and platform service layer.
 *
 * Feature: 002-platform-api-service
 * Date: 2025-12-26
 */

import type { Balance, Cost, Token, TokenGroup, PlatformType } from '@/lib/api/adapters/types';
import type { TenantInfo, Tenant } from '@/types/tenant';
import type { PaginationResult, CostPeriod } from '@/types/api';

// =============================================================================
// Service Interface
// =============================================================================

/**
 * Contract for platform-specific service implementations.
 * All platform services (NewAPIService, etc.) must implement this.
 */
export interface IPlatformService {
  /** Get tenant metadata (credit unit, exchange rate, endpoints, notices) */
  getTenantInfo(): Promise<TenantInfo>;

  /** Get user's credit balance */
  getBalance(): Promise<Balance>;

  /** Get paginated list of API tokens */
  getTokens(page: number, size: number): Promise<PaginationResult<Token>>;

  /** Get all token groups with metadata */
  getTokenGroups(): Promise<Record<string, TokenGroup>>;

  /** Get cost data for specified period */
  getCostData(period: CostPeriod): Promise<Cost[]>;
}

// =============================================================================
// Generic Service Interface
// =============================================================================

/**
 * Contract for the generic platform API service.
 * Business layer MUST only use this interface.
 */
export interface IPlatformAPIService extends IPlatformService {
  /** The tenant this service instance is bound to */
  readonly tenant: Tenant;

  /** The resolved platform type (defaults to 'newapi' if undefined) */
  readonly platformType: PlatformType;
}

// =============================================================================
// Error Types
// =============================================================================

/**
 * Error thrown when a platform service API call fails.
 * Wraps the original error with platform context.
 */
export interface IPlatformAPIError extends Error {
  readonly platformType: PlatformType;
  readonly method: string;
  readonly cause: Error;
}

/**
 * Error thrown when an adapter cannot transform data.
 */
export interface IAdapterTransformError extends Error {
  readonly sourceShape: string;
  readonly targetType: string;
  readonly cause?: Error;
}

/**
 * Error thrown when an unsupported platform type is requested.
 */
export interface IPlatformNotSupportedError extends Error {
  readonly platformType: string;
}

// =============================================================================
// Service Registry
// =============================================================================

/**
 * Factory function type for creating platform services.
 */
export type PlatformServiceFactory = (tenant: Tenant) => IPlatformService;

/**
 * Registry mapping platform types to service factories.
 * Currently only 'newapi' is supported.
 */
export type PlatformServiceRegistry = Record<PlatformType, PlatformServiceFactory>;
