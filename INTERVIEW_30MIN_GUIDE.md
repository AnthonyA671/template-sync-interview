# ⚡ 30-Minute Interview Process Guide

## ⏱️ Total Time: 30 minutes
- **Setup**: 2 minutes
- **Coding**: 25 minutes
- **Wrap-up**: 3 minutes

---

## 🎯 Quick Start (2 minutes)

### Interviewer Script:
```
"You have a template synchronization bug to fix. Users are losing data
when updating simultaneously. You have 25 minutes to fix 1-3 issues.
We can test each fix individually."
```

### Setup Commands:
```bash
# Candidate runs:
git clone https://github.com/AnthonyA671/template-sync-interview.git
cd template-sync-interview
npm install
```

---

## 🚀 Coding Phase (25 minutes)

### Priority Order - Fix What You Can:

#### 🥇 **Priority 1: Concurrent Updates (10 min)**
**The Problem:** Two users updating simultaneously causes data loss

**Test ONLY this requirement:**
```bash
npm test -- --testNamePattern="Concurrent Updates"
# Or shorter:
npm test -- -t "Concurrent"
```

**Quick Solution Hint:**
```typescript
// Add version checking:
const current = await getTemplate(id);
// Update with version check
.eq('version', current.version)
```

---

#### 🥈 **Priority 2: Cache Invalidation (8 min)**
**The Problem:** Users see old data after updates

**Test ONLY this requirement:**
```bash
npm test -- --testNamePattern="Cache Management"
# Or shorter:
npm test -- -t "Cache"
```

**Quick Solution Hint:**
```typescript
// After successful update:
this.cache.delete(templateId);
```

---

#### 🥉 **Priority 3: Retry Logic (7 min)**
**The Problem:** Conflicts cause immediate failure

**Test ONLY this requirement:**
```bash
npm test -- --testNamePattern="Retry Logic"
# Or shorter:
npm test -- -t "Retry"
```

**Quick Solution Hint:**
```typescript
// Simple retry:
for (let i = 0; i < 2; i++) {
  try {
    // attempt update
  } catch (error) {
    if (i === 0) continue;
    throw error;
  }
}
```

---

## 🧪 Individual Test Commands Reference

### Run Specific Test Groups:
```bash
# Test ONLY concurrent updates (2 tests)
npm test -- -t "Concurrent"

# Test ONLY cache management (2 tests)
npm test -- -t "Cache"

# Test ONLY retry logic (2 tests)
npm test -- -t "Retry"

# Run all tests
npm test
```

### Run Single Specific Test:
```bash
# Test specific scenario
npm test -- -t "should handle two users updating different fields"
npm test -- -t "should return fresh data after update"
npm test -- -t "should retry on conflict"
```

---

## ⏰ Time Management Strategy

### Option A: Focus Deep (Recommended)
| Time | Task | Verify |
|------|------|--------|
| 0-2 min | Setup & read problem | - |
| 2-12 min | Fix Priority 1 completely | `npm test -- -t "Concurrent"` ✅ |
| 12-20 min | Fix Priority 2 completely | `npm test -- -t "Cache"` ✅ |
| 20-25 min | Attempt Priority 3 | `npm test -- -t "Retry"` ⚠️ |
| 25-30 min | Discuss solution | - |

### Option B: Touch Everything
| Time | Task | Verify |
|------|------|--------|
| 0-2 min | Setup & read problem | - |
| 2-10 min | Partial fix for all 3 | - |
| 10-20 min | Make tests pass | Test each individually |
| 20-25 min | Clean up best solution | Focus on 1 that works |
| 25-30 min | Discuss approach | - |

---

## 📊 Adjusted Scoring for 30 Minutes

### Per Requirement (Test Individually):
```bash
# Each can be tested and scored separately:
```

| Requirement | Command | Points | Time Expected |
|------------|---------|---------|---------------|
| Concurrent Updates | `npm test -- -t "Concurrent"` | 4 pts | 10 min |
| Cache Management | `npm test -- -t "Cache"` | 3 pts | 8 min |
| Retry Logic | `npm test -- -t "Retry"` | 3 pts | 7 min |

### Final Score Interpretation:
- **10 points**: All 3 requirements work (exceptional for 30 min)
- **7 points**: 2 requirements work (good performance)
- **4 points**: 1 requirement works (acceptable)
- **2 points**: Good attempt, partial solutions
- **0 points**: Didn't understand problem

---

## 🏃 Speed Run Checklist for Candidates

### Fix #1 - Concurrent Updates (Must Do)
```bash
# 1. Add version to update
# 2. Check version match
# 3. Test:
npm test -- -t "Concurrent"  # ✅ 2 passing
```

### Fix #2 - Cache (Should Do)
```bash
# 1. Find cache.set line
# 2. Change to cache.delete after update
# 3. Test:
npm test -- -t "Cache"  # ✅ 2 passing
```

### Fix #3 - Retry (If Time)
```bash
# 1. Wrap update in loop
# 2. Max 2 attempts
# 3. Test:
npm test -- -t "Retry"  # ✅ 2 passing
```

---

## 💬 3-Minute Wrap-up Discussion

### If candidate fixed 1 requirement:
- "Walk me through your solution for [requirement]"
- "What would you do for the other issues given more time?"

### If candidate fixed 2+ requirements:
- "Which fix was most challenging and why?"
- "How would this scale to 100 concurrent users?"

### If candidate struggled:
- "What was the main blocker you encountered?"
- "How would you debug this in production?"

---

## 🎯 Evaluation Quick Sheet

### For Partial Completion:
```bash
# Run individual tests to give credit:
npm test -- -t "Concurrent"  # Check: _/4 points
npm test -- -t "Cache"       # Check: _/3 points
npm test -- -t "Retry"       # Check: _/3 points
```

### Quick Evaluation:
- [ ] **Understood problem quickly?** (0-2 pts)
- [ ] **Fixed at least 1 issue?** (0-4 pts)
- [ ] **Clean, logical code?** (0-2 pts)
- [ ] **Good communication?** (0-2 pts)

**Total: ___/10**

---

## 🚨 Time Shortcuts for Interviewer

### If running very short on time:
```bash
# Just test their main focus area:
"Show me which problem you focused on"
npm test -- -t "[Their choice]"

# Give partial credit for attempt
```

### If candidate is stuck (10 min in):
```bash
# Suggest focusing on one:
"Let's focus on just the cache issue"
npm test -- -t "Cache"

# Provide more hints
```

### If candidate finishes early:
```bash
# Run all tests:
npm test

# Ask deeper questions about scalability
```

---

## 📝 Sample 30-Minute Timeline

| Time | Action | Check |
|------|--------|-------|
| 0:00 | Start, clone repo | Setup working? |
| 0:02 | Read problem | Understanding? |
| 0:05 | Start fixing concurrent issue | Right approach? |
| 0:10 | Test concurrent: `npm test -- -t "Concurrent"` | Pass? ✅ |
| 0:12 | Start fixing cache | Delete vs TTL? |
| 0:18 | Test cache: `npm test -- -t "Cache"` | Pass? ✅ |
| 0:20 | Start retry logic | Loop vs recursion? |
| 0:25 | Test retry: `npm test -- -t "Retry"` | Pass? ⚠️ |
| 0:27 | Quick discussion | Can explain? |
| 0:30 | End | Score: 7/10 |

---

## ✅ Minimum Bar for 30 Minutes

**To Pass:**
- Fix at least ONE requirement completely
- Show understanding of the problem
- Be able to explain the solution

**Good Performance:**
- Fix TWO requirements
- Clean code
- Articulate trade-offs

**Excellent (rare in 30 min):**
- Fix all THREE requirements
- Elegant solutions
- Time to discuss