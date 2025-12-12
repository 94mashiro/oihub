import type { BackgroundModule } from './types';

class ModuleRegistry {
  private cleanups: Array<() => void> = [];

  initAll(modules: BackgroundModule[]): () => void {
    for (const mod of modules) {
      console.log(`[background] Initializing module: ${mod.name}`);
      const cleanup = mod.init();
      if (cleanup) {
        this.cleanups.push(cleanup);
      }
    }

    return () => {
      for (const cleanup of this.cleanups.reverse()) {
        cleanup();
      }
      this.cleanups = [];
    };
  }
}

export const moduleRegistry = new ModuleRegistry();
