/** 排序字段枚举 */
export enum SortField {
  /** 手动排序（拖拽） */
  MANUAL = 'manual',
  /** 按名称排序 */
  NAME = 'name',
  /** 按余额排序 */
  BALANCE = 'balance',
  /** 按今日消耗排序 */
  TODAY_COST = 'today_cost',
}

/** 排序方向 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

/** 排序配置 */
export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
