/**
 * 请求去重器 - 相同请求同时发起时只执行一次，共享结果
 */
class RequestDeduplicator {
  private pending = new Map<string, Promise<unknown>>();

  generateKey(url: string, method: string, userId?: string): string {
    return JSON.stringify({ url, method, userId });
  }

  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fn().finally(() => this.pending.delete(key));
    this.pending.set(key, promise);
    return promise;
  }
}

export const deduplicator = new RequestDeduplicator();
