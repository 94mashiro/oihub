import { toastManager } from '@/components/ui/toast';
import { NewAPIError } from './types';

/**
 * 显示 API 错误 Toast（1 秒后自动关闭）
 */
export function showApiError(error: NewAPIError): void {
  const id = toastManager.add({
    title: '请求失败',
    description: error.message,
    type: 'error',
  });
  setTimeout(() => {
    try {
      toastManager.close(id);
    } catch {
      // ignore error
    }
  }, 1000);
}

/**
 * 默认错误处理器，用于 NewAPIClient 的 onError 配置
 */
export const defaultErrorHandler = showApiError;
