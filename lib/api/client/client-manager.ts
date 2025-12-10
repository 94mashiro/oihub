import { APIClient } from './api-client';
import { defaultErrorHandler } from './error-handler';
import type { Tenant } from '@/types/tenant';

/**
 * 客户端管理器 - 复用 client 实例
 */
class ClientManager {
  private clients = new Map<string, APIClient>();

  /**
   * 获取租户对应的 API 客户端（复用已有实例）
   */
  getClient(tenant: Tenant): APIClient {
    const key = `${tenant.url}|${tenant.userId}|${tenant.token}`;
    let client = this.clients.get(key);
    if (!client) {
      client = new APIClient({
        baseURL: tenant.url,
        token: tenant.token,
        userId: tenant.userId,
        onError: defaultErrorHandler,
      });
      this.clients.set(key, client);
    }
    return client;
  }

  /**
   * 使指定租户的客户端失效（配置变更时调用）
   */
  invalidate(tenantId?: string): void {
    if (!tenantId) {
      this.clients.clear();
      return;
    }
    // 由于 key 不包含 tenantId，需要遍历清除
    // 实际场景中可以维护 tenantId -> key 的映射
    this.clients.clear();
  }
}

export const clientManager = new ClientManager();
