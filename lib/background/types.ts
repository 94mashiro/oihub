import type { Browser } from 'wxt/browser';

export interface BackgroundModule {
  name: string;
  init(): void | (() => void);
}

export type MessageHandler = (
  payload: unknown,
  sender: Browser.runtime.MessageSender,
) => Promise<unknown>;
