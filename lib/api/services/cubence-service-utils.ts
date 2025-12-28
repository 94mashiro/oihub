/**
 * Cubence service utility functions
 */

/**
 * Cubence Costs 分页响应接口 - 包含 logs 数组和分页信息
 */
export interface CubenceCostsPaginatedResponse<T> {
  logs?: T[];
  total?: number;
  total_pages?: number;
  page?: number;
  page_size?: number;
}

/**
 * Cubence Costs 分页获取函数类型
 */
export type CubenceCostsPaginatedFetcher<T> = (
  page: number,
  pageSize: number,
) => Promise<CubenceCostsPaginatedResponse<T>>;

/**
 * 递归获取所有 Cubence Costs 分页数据
 * 使用 total_pages 字段判断是否还有更多数据
 *
 * @param fetcher - 分页数据获取函数，接收 page 和 pageSize 参数，返回分页响应
 * @param pageSize - 每页大小，默认 100
 * @returns 合并后的所有数据
 */
export async function fetchAllCubenceCostsPages<T>(
  fetcher: CubenceCostsPaginatedFetcher<T>,
  pageSize = 100,
): Promise<CubenceCostsPaginatedResponse<T>> {
  const allLogs: T[] = [];
  let page = 1;
  let totalPages = 0;
  let total = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetcher(page, pageSize);
    console.log('response', response);

    // 收集当前页的数据
    if (response.logs && Array.isArray(response.logs)) {
      allLogs.push(...response.logs);
    }

    // 首次获取时记录总数和总页数
    if (page === 1) {
      if (response.total !== undefined) {
        total = response.total;
      }
      if (response.total_pages !== undefined) {
        totalPages = response.total_pages;
      }
    }

    // 根据 total_pages 判断是否还有更多数据
    if (totalPages > 0) {
      hasMore = page < totalPages;
    } else {
      // 如果没有 total_pages，则根据当前页数据量判断
      const currentPageSize = response.logs?.length ?? 0;
      hasMore = currentPageSize === pageSize;
    }

    if (hasMore) {
      page++;
    }
  }

  // 返回合并后的数据
  return {
    logs: allLogs,
    total: total || allLogs.length,
    total_pages: totalPages || Math.ceil(allLogs.length / pageSize),
    page: 1,
    page_size: allLogs.length,
  };
}
