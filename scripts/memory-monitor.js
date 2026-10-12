#!/usr/bin/env node

/**
 * Memory Monitor Script
 * Monitors Node.js application memory usage and provides alerts
 */

const fs = require('fs');
const path = require('path');

class MemoryMonitor {
  constructor(options = {}) {
    this.interval = options.interval || 30000; // 30 seconds
    this.threshold = options.threshold || 80; // 80% heap usage
    this.logFile = options.logFile || './logs/memory-usage.log';
    this.isRunning = false;

    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  start() {
    if (this.isRunning) {
      console.log('Memory monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log(
      `Memory monitor started. Checking every ${this.interval / 1000} seconds`,
    );

    this.monitor();
    this.intervalId = setInterval(() => this.monitor(), this.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Memory monitor stopped');
  }

  monitor() {
    const usage = process.memoryUsage();
    const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;

    const logEntry = {
      timestamp: new Date().toISOString(),
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapUsagePercent: Math.round(heapUsagePercent * 100) / 100,
      external: Math.round(usage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024), // MB
    };

    // Log to file
    fs.appendFileSync(this.logFile, `${JSON.stringify(logEntry)}\n`);

    // Console output
    console.log(
      `Memory: ${logEntry.heapUsed}/${logEntry.heapTotal}MB (${logEntry.heapUsagePercent}%)`,
    );

    // Alert if threshold exceeded
    if (heapUsagePercent > this.threshold) {
      console.warn(
        `⚠️  HIGH MEMORY USAGE: ${logEntry.heapUsagePercent}% (threshold: ${this.threshold}%)`,
      );

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('🔄 Garbage collection triggered');
      }
    }
  }

  getStats() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapUsagePercent:
        Math.round((usage.heapUsed / usage.heapTotal) * 10000) / 100,
      external: Math.round(usage.external / 1024 / 1024),
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024),
    };
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === '--interval') {
      options.interval = parseInt(args[i + 1]) * 1000;
    } else if (args[i] === '--threshold') {
      options.threshold = parseInt(args[i + 1]);
    } else if (args[i] === '--log-file') {
      options.logFile = args[i + 1];
    }
  }

  const monitor = new MemoryMonitor(options);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down memory monitor...');
    monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nShutting down memory monitor...');
    monitor.stop();
    process.exit(0);
  });

  monitor.start();
}

module.exports = MemoryMonitor;
