/**
 * Response Aggregate Types
 *
 * These types bundle multiple API responses together before adapter transformation.
 * Used in the orchestrator layer to provide typed multi-endpoint responses.
 */

import type {
  NewAPIBalanceResponse,
  NewAPICostsResponse,
  NewAPITokensResponse,
  NewAPITokenGroupsResponse,
  NewAPITenantInfoResponse,
} from './newapi-response-types';

import type {
  CubenceBalanceResponse,
  CubenceCostsResponse,
  CubenceTokensResponse,
  CubenceTokenGroupsResponse,
  CubenceTenantInfoResponse,
} from './cubence-response-types';

import type {
  PackyCodeCodexBalanceResponse,
  PackyCodeCodexCostsResponse,
  PackyCodeCodexTokensResponse,
  PackyCodeCodexTokenGroupsResponse,
  PackyCodeCodexTenantInfoResponse,
} from './packycode-codex-response-types';

// ============================================================================
// Balance Sources
// ============================================================================

export interface NewAPIBalanceSources {
  primary: NewAPIBalanceResponse;
}

export interface CubenceBalanceSources {
  primary: CubenceBalanceResponse;
}

export interface PackyCodeCodexBalanceSources {
  primary: PackyCodeCodexBalanceResponse;
}

export type BalanceSources =
  | NewAPIBalanceSources
  | CubenceBalanceSources
  | PackyCodeCodexBalanceSources;

// ============================================================================
// Cost Sources
// ============================================================================

export interface NewAPICostSources {
  costs: NewAPICostsResponse;
}

export interface CubenceCostSources {
  costs: CubenceCostsResponse;
}

export interface PackyCodeCodexCostSources {
  costs: PackyCodeCodexCostsResponse;
}

export type CostSources = NewAPICostSources | CubenceCostSources | PackyCodeCodexCostSources;

// ============================================================================
// Token Sources
// ============================================================================

export interface NewAPITokenSources {
  tokens: NewAPITokensResponse;
  groups?: NewAPITokenGroupsResponse;
}

export interface CubenceTokenSources {
  tokens: CubenceTokensResponse;
  groups?: CubenceTokenGroupsResponse;
}

export interface PackyCodeCodexTokenSources {
  tokens: PackyCodeCodexTokensResponse;
  groups?: PackyCodeCodexTokenGroupsResponse;
}

export type TokenSources = NewAPITokenSources | CubenceTokenSources | PackyCodeCodexTokenSources;

// ============================================================================
// TenantInfo Sources
// ============================================================================

export interface NewAPITenantInfoSources {
  status: NewAPITenantInfoResponse;
}

export interface CubenceTenantInfoSources {
  status: CubenceTenantInfoResponse;
}

export interface PackyCodeCodexTenantInfoSources {
  status: PackyCodeCodexTenantInfoResponse;
}

export type TenantInfoSources =
  | NewAPITenantInfoSources
  | CubenceTenantInfoSources
  | PackyCodeCodexTenantInfoSources;
