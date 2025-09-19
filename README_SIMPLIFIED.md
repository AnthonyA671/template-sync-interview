# Template Update Race Condition Challenge (30-45 min)

## 🎯 The Problem

You're working on a template management system where multiple users can edit templates simultaneously. Currently, **users are losing their changes** when they update at the same time. Your task is to fix this critical bug.

## ⏱️ Time Expectation: 30-45 minutes

## 🔧 Core Requirements (Must Fix)

### 1. **Prevent Data Loss** (15-20 min)
When two users update the same template simultaneously, both changes should be handled properly. Currently, one update silently overwrites the other.

### 2. **Fix Cache Staleness** (10-15 min)
After updating a template, users sometimes see old data. The cache needs to be properly invalidated after updates.

### 3. **Add Basic Retry Logic** (10-15 min)
When updates conflict, the system should retry at least once instead of immediately failing.

## 📁 Files to Focus On

You only need to modify **`src/problem.ts`**:
- `TemplateService.updateTemplate()` - Main update logic
- `TemplateService.getTemplate()` - Cache management
- Add any helper methods you need

## 🎪 Simple Test Scenario

```typescript
// This currently FAILS - make it pass!
async function testConcurrentUpdates() {
  // User A and User B update simultaneously
  const [resultA, resultB] = await Promise.all([
    service.updateTemplate('template-1', { name: 'Updated by A' }),
    service.updateTemplate('template-1', { description: 'Updated by B' })
  ]);

  // Both updates should succeed (or at least one with proper retry)
  const final = await service.getTemplate('template-1');

  // Should have changes from successful updates
  assert(final.name || final.description); // Not both lost!
}
```

## 💡 Hints for Quick Solution

### Hint 1: Simple Version Check
```typescript
// Add a version field to track changes
if (current.version !== expectedVersion) {
  // Handle conflict - retry or merge
}
```

### Hint 2: Cache Invalidation
```typescript
// After successful update:
this.cache.delete(templateId);
// Or mark as stale
```

### Hint 3: Basic Retry
```typescript
async function retryOnce(fn) {
  try {
    return await fn();
  } catch (error) {
    // Wait a bit and try once more
    await sleep(100);
    return await fn();
  }
}
```

## ✅ Success Criteria

Your solution should:
1. **Handle 2 concurrent updates** without losing data
2. **Return fresh data** after updates (no stale cache)
3. **Retry at least once** on conflicts
4. Pass the basic test suite

## 🚀 Getting Started

```bash
# Install and run tests
npm install
npm test

# You should see failures initially
# Your goal: Make the tests pass!
```

## 📊 Evaluation (Simplified)

### Good Solution (7-10 points)
- ✅ Prevents data loss in concurrent updates
- ✅ Cache properly invalidated
- ✅ Basic retry mechanism
- ✅ All tests pass

### Acceptable Solution (5-6 points)
- ✅ Fixes most concurrent update issues
- ⚠️ Some cache issues remain
- ✅ At least attempted retry logic

### Needs Improvement (3-4 points)
- ⚠️ Partial fix for concurrency
- ⚠️ Cache still problematic
- ⚠️ No retry mechanism

## 🎯 Focus Areas for 30-45 Minutes

**First 15 minutes:**
- Understand the problem
- Run tests to see failures
- Identify the race condition

**Next 20 minutes:**
- Implement version checking
- Add cache invalidation
- Basic retry logic

**Last 10 minutes:**
- Test your solution
- Handle edge cases
- Clean up code

## 💬 Discussion Topics (If Time Permits)

- How would you handle 10 concurrent users?
- What's the trade-off between last-write-wins vs merging?
- How would you monitor this in production?

---

**Remember**: A simple working solution is better than a complex broken one. Focus on making the basic tests pass first!