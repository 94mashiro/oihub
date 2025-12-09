export type PaginationResult<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export enum CostPeriod {
  DAY_1 = '1d',
  DAY_7 = '7d',
  DAY_14 = '14d',
  DAY_30 = '30d',
}

export const COST_PERIOD_DAYS: Record<CostPeriod, number> = {
  [CostPeriod.DAY_1]: 1,
  [CostPeriod.DAY_7]: 7,
  [CostPeriod.DAY_14]: 14,
  [CostPeriod.DAY_30]: 30,
};
