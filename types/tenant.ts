export interface Tenant {
  id: string;
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
}
