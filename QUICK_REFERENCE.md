# 🚀 30-Minute Interview Quick Reference

## For Interviewer: Test Commands

### Individual Requirement Tests
```bash
# Test each requirement separately:
npm test:concurrent  # Test Problem 1 (4 points)
npm test:cache       # Test Problem 2 (3 points)
npm test:retry       # Test Problem 3 (3 points)

# Or manually:
npm test -- -t "Concurrent"
npm test -- -t "Cache"
npm test -- -t "Retry"
```

## For Candidate: 30-Minute Strategy

### ⏱️ Time Allocation
- **Minutes 0-2**: Setup
- **Minutes 2-12**: Fix Problem 1 (Concurrent Updates)
- **Minutes 12-20**: Fix Problem 2 (Cache)
- **Minutes 20-27**: Fix Problem 3 (Retry) - if time
- **Minutes 27-30**: Wrap up

### 🎯 Priority Order

#### 1️⃣ MUST DO: Concurrent Updates (10 min)
```typescript
// Problem: Data loss when 2 users update
// Fix: Add version checking

// Quick test:
npm test:concurrent
```

#### 2️⃣ SHOULD DO: Cache Fix (8 min)
```typescript
// Problem: Stale data after updates
// Fix: this.cache.delete(templateId)

// Quick test:
npm test:cache
```

#### 3️⃣ IF TIME: Retry Logic (7 min)
```typescript
// Problem: Fails on conflict
// Fix: Loop with 2 attempts

// Quick test:
npm test:retry
```

## 📊 Scoring Breakdown

| What Works | Command | Points |
|------------|---------|--------|
| Concurrent Updates | `npm test:concurrent` | 4/10 |
| + Cache Management | `npm test:cache` | 7/10 |
| + Retry Logic | `npm test:retry` | 10/10 |

### Minimum to Pass: 4/10 (Fix one problem completely)

## 🆘 If Stuck

### Can't fix all 3? Focus on ONE:
```bash
# Pick your best and make it perfect:
npm test:concurrent  # Focus here for 20 min
```

### Last 5 minutes?
```bash
# Test what you have:
npm test  # See overall progress
```

### No time to finish?
```javascript
// Add a comment showing your approach:
// TODO: Would add version checking here
// by getting current.version first
// then checking if update affected rows
```

## ✅ Success Checklist

- [ ] At least 1 test group passing
- [ ] Can explain your solution
- [ ] Code runs without errors
- [ ] Used test commands to verify