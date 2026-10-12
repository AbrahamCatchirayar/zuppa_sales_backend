# Memory Optimization Guide

This guide provides solutions for the JavaScript heap out of memory errors that can occur in the Rubicr backend service.

## Quick Fixes

### 1. Increase Node.js Heap Memory

The application has been configured with increased heap memory limits:

- **Production**: 4GB heap size via PM2 configuration
- **Development**: 4GB heap size via npm scripts

### 2. Restart the Application

If you encounter memory issues, restart the application:

```bash
# Using PM2
pm2 restart rubicr-backend

# Or stop and start
pm2 stop rubicr-backend
pm2 start ecosystem.config.js
```

## Memory Monitoring

### Monitor Memory Usage

```bash
# Check current memory usage
npm run memory:check

# Start continuous monitoring
npm run memory:monitor

# Monitor with custom settings
node scripts/memory-monitor.js --interval 60 --threshold 70
```

### Memory Usage Thresholds

- **Normal**: < 70% heap usage
- **Warning**: 70-80% heap usage
- **Critical**: > 80% heap usage (triggers automatic restart)

## Root Causes & Solutions

### 1. Deeply Nested Promise.all() Chains

**Problem**: Multiple nested async operations create memory pressure.

**Solution**: Replaced with sequential processing in critical methods:
- `_getResponseByDatacube()`
- `getAnalyticsResponse()`

### 2. Large Database Queries

**Problem**: Loading entire object trees with deep relations.

**Solutions**:
- Process data in smaller batches (5-10 items at a time)
- Use pagination for large datasets
- Limit relation depth in queries

### 3. Memory Leaks in Event Subscribers

**Problem**: Database connections not properly released.

**Solution**: Ensure proper cleanup in `finally` blocks:

```typescript
try {
  // Database operations
} finally {
  await queryRunner.release();
  await publicDataSource.destroy();
}
```

## Performance Optimizations

### 1. Database Query Optimization

```typescript
// Instead of loading all relations at once
const data = await repository.find({
  relations: ['deep', 'nested', 'relations']
});

// Load only necessary data
const data = await repository.find({
  select: ['id', 'name', 'essential_field'],
  relations: ['required_relation']
});
```

### 2. Batch Processing

```typescript
// Process large datasets in chunks
for (let i = 0; i < data.length; i += 10) {
  const chunk = data.slice(i, i + 10);
  await processChunk(chunk);
  
  // Force garbage collection
  if (global.gc) global.gc();
}
```

### 3. Memory Management Utility

Use the `MemoryManager` utility for memory-intensive operations:

```typescript
import { MemoryManager } from '../utils/memory-manager';

const memoryManager = new MemoryManager();

// Process data in chunks with automatic GC
const results = await memoryManager.processInChunks(
  largeDataset,
  100,
  async (chunk) => await processChunk(chunk)
);
```

## Troubleshooting

### Check Memory Usage

```bash
# Get detailed memory stats
node -e "
const usage = process.memoryUsage();
console.log('RSS:', Math.round(usage.rss / 1024 / 1024), 'MB');
console.log('Heap Total:', Math.round(usage.heapTotal / 1024 / 1024), 'MB');
console.log('Heap Used:', Math.round(usage.heapUsed / 1024 / 1024), 'MB');
console.log('External:', Math.round(usage.external / 1024 / 1024), 'MB');
"
```

### Force Garbage Collection

```bash
# Start Node.js with garbage collection enabled
node --expose-gc --max-old-space-size=2048 dist/main

# Or trigger manually in code
if (global.gc) global.gc();
```

### Monitor Application Logs

Check PM2 logs for memory-related issues:

```bash
pm2 logs rubicr-backend --lines 100
```

## Production Deployment

### PM2 Configuration

The `ecosystem.config.js` includes:

- **Memory limits**: 4GB heap size
- **Auto-restart**: When memory exceeds 3GB
- **Garbage collection**: Enabled with optimized settings
- **Logging**: Comprehensive error and output logging

### Environment Variables

```bash
# Set Node.js memory flags
export NODE_OPTIONS="--max-old-space-size=2048 --expose-gc"

# Or in .env file
NODE_OPTIONS=--max-old-space-size=2048 --expose-gc
```

## Best Practices

### 1. Database Connections

- Always release query runners in `finally` blocks
- Use connection pooling effectively
- Close unused connections

### 2. Data Processing

- Process large datasets in chunks
- Avoid loading unnecessary relations
- Use streaming for very large files

### 3. Memory Management

- Monitor memory usage regularly
- Implement proper error handling
- Use garbage collection strategically

### 4. Code Optimization

- Avoid deep nesting of async operations
- Use efficient data structures
- Implement proper cleanup mechanisms

## Emergency Procedures

### If Application Crashes Due to Memory

1. **Immediate Action**:
   ```bash
   pm2 restart rubicr-backend
   ```

2. **Check Memory Usage**:
   ```bash
   npm run memory:check
   ```

3. **Monitor Recovery**:
   ```bash
   npm run memory:monitor
   ```

4. **If Issues Persist**:
   - Check application logs
   - Review recent database queries
   - Consider scaling up server resources

### Contact Support

If memory issues persist after implementing these solutions:

1. Collect memory usage logs
2. Provide application error logs
3. Share database query performance metrics
4. Document the steps that trigger the issue

## Additional Resources

- [Node.js Memory Management](https://nodejs.org/en/docs/guides/memory-management/)
- [PM2 Memory Management](https://pm2.keymetrics.io/docs/usage/monitoring/)
- [TypeORM Performance](https://typeorm.io/#/performance) 