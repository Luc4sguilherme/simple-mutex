export class SimpleMutex {
  private queue: Array<() => void>;
  private locked: boolean;

  constructor() {
    this.queue = [];

    this.locked = false;
  }

  async lock(): Promise<void> {
    if (this.locked) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.locked = true;
  }

  unlock(): void {
    if (this.queue.length > 0) {
      const nextResolve = this.queue.shift();
      if (nextResolve) {
        nextResolve();
      }
    } else {
      this.locked = false;
    }
  }

  async runExclusive<T>(callback: () => Promise<T>): Promise<T> {
    await this.lock();

    try {
      return await callback();
    } finally {
      this.unlock();
    }
  }
}
