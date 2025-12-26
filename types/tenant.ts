import type { PlatformType } from '@/lib/api/adapters';

export interface Tenant {
  id: TenantId;
  name: string;
  token: string;
  /** NewAPI 专属字段 */
  userId?: string;
  url: string;
  platformType?: PlatformType;
}

export interface ApiEndpoint {
  id: number;
  route: string;
  description: string;
  url: string;
}

export interface Notice {
  id: number;
  content: string;
  extra: string;
  publishDate: string;
  type: string;
}

export interface TenantInfo {
  creditUnit?: number;
  exchangeRate?: number;
  displayFormat?: string;
  endpoints?: ApiEndpoint[];
  notices?: Notice[];
}

export type TenantId = string;
