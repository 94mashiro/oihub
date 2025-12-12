export interface Tenant {
  id: TenantId;
  name: string;
  token: string;
  userId: string;
  url: string;
  info?: TenantInfo;
}

export interface TenantInfo {
  quota_per_unit: number;
  usd_exchange_rate: number;
  quota_display_type: string;
  api_info: {
    id: number;
    route: string;
    description: string;
    url: string;
  }[];
  announcements?: {
    content: string;
    extra: string;
    id: number;
    publishDate: string;
    type: string;
  }[];
}

export type TenantId = string;
