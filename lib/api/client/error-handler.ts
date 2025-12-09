import { toastManager } from '@/components/ui/toast';
import type { APIError } from '../types';

/**
 * 显示 API 错误 toast
 */
export function showApiError(error: APIError): void {
  if (error.silent) return;
  toastManager.add({ title: error.message, type: 'error', timeout: 1000 });
}

/**
 * 默认错误处理器
 */
export const defaultErrorHandler = (error: APIError): void => {
  showApiError(error);
};
