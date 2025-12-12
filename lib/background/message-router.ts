import type { MessageHandler } from './types';

class MessageRouter {
  private handlers = new Map<string, MessageHandler>();
  private initialized = false;

  register(type: string, handler: MessageHandler): void {
    this.handlers.set(type, handler);
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const handler = this.handlers.get(message.type);
      if (!handler) return false;

      handler(message.payload, sender)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({ success: false, error: error.message || 'Request failed' });
        });

      return true;
    });
  }
}

export const messageRouter = new MessageRouter();
