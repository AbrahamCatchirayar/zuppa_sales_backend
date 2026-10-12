import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MemoryManager {
  private readonly logger = new Logger(MemoryManager.name);

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
      this.logger.debug('Garbage collection triggered');
    }
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  } {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024), // MB
    };
  }

  /**
   * Log memory usage
   */
  logMemoryUsage(context = 'Memory Usage'): void {
    const usage = this.getMemoryUsage();
    this.logger.log(
      `${context}: RSS: ${usage.rss}MB, Heap: ${usage.heapUsed}/${usage.heapTotal}MB, External: ${usage.external}MB`,
    );
  }

  /**
   * Check if memory usage is high
   */
  isMemoryUsageHigh(threshold = 80): boolean {
    const usage = this.getMemoryUsage();
    const heapUsagePercentage = (usage.heapUsed / usage.heapTotal) * 100;
    return heapUsagePercentage > threshold;
  }

  /**
   * Process data in chunks to prevent memory leaks
   */
  async processInChunks<T, R>(
    data: T[],
    chunkSize: number,
    processor: (chunk: T[]) => Promise<R[]>,
    onChunkComplete?: (chunk: R[]) => void,
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const chunkResults = await processor(chunk);

      if (onChunkComplete) {
        onChunkComplete(chunkResults);
      }

      results.push(...chunkResults);

      // Force garbage collection after each chunk
      this.forceGarbageCollection();

      // Log memory usage every 10 chunks
      if (i % (chunkSize * 10) === 0) {
        this.logMemoryUsage(
          `Processing chunk ${Math.floor(i / chunkSize) + 1}`,
        );
      }
    }

    return results;
  }

  /**
   * Create a memory-safe async iterator
   */
  async *createAsyncIterator<T>(
    data: T[],
    chunkSize = 100,
  ): AsyncGenerator<T[], void, unknown> {
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      yield chunk;

      // Force garbage collection after yielding
      this.forceGarbageCollection();
    }
  }
}
