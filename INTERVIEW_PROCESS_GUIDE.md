# 📋 Interview Process Guide - Step by Step

## ⏱️ Total Time: 45-60 minutes
- **Coding**: 30-45 minutes
- **Discussion**: 10-15 minutes

---

## 🚀 Phase 1: Setup (5 minutes)

### Interviewer Says:
```
"We have a coding problem for you today about fixing a template synchronization issue.
You'll have 30-45 minutes to implement a solution. The problem simulates a real bug
where users are losing data when updating templates simultaneously."
```

### Step 1: Share the Repository
```bash
# Interviewer shares:
"Please clone this repository and set it up:"
https://github.com/AnthonyA671/template-sync-interview

# Candidate runs:
git clone https://github.com/AnthonyA671/template-sync-interview.git
cd template-sync-interview
npm install
```

### Step 2: Verify Setup
```bash
# Candidate should run:
npm test

# Expected output:
"FAIL: 6 tests failing" (this is correct - they need to fix these)
```

### Step 3: Orient to the Problem
```
"Open README_SIMPLIFIED.md for the problem description.
You only need to modify src/problem-simplified.ts.
The tests in tests/template-simplified.test.ts show what needs to work."
```

---

## 🧑‍💻 Phase 2: Coding (30-45 minutes)

### What Candidate Should Do:

#### Minute 0-5: Understanding
1. Read `README_SIMPLIFIED.md`
2. Look at the failing tests
3. Open `src/problem-simplified.ts`
4. Identify the 3 problems marked with TODO comments

#### Minute 5-15: Fix Problem #1 (Concurrent Updates)
```typescript
// Candidate should add version checking:
// 1. Get current template with version
// 2. Update with version in WHERE clause
// 3. Check if update succeeded (rows affected)
```

**Test Progress:**
```bash
npm test
# Should see: "Concurrent Updates ✓" (2 tests passing)
```

#### Minute 15-25: Fix Problem #2 (Cache Invalidation)
```typescript
// Candidate should:
// 1. Delete cache entry after successful update
// 2. Or add cache timeout logic
```

**Test Progress:**
```bash
npm test
# Should see: "Cache Management ✓" (4 tests passing)
```

#### Minute 25-35: Fix Problem #3 (Add Retry)
```typescript
// Candidate should:
// 1. Wrap update in retry loop (max 2-3 attempts)
// 2. Add small delay between retries
// 3. Return success: false if all retries fail
```

**Test Progress:**
```bash
npm test
# Should see: "All tests passing ✓" (6 tests passing)
```

#### Minute 35-45: Cleanup & Edge Cases
- Clean up code
- Add comments if time permits
- Handle edge cases
- Run tests one final time

---

## ✅ Phase 3: Verification (2 minutes)

### Candidate Runs Final Tests:
```bash
# Full test suite
npm test

# Expected output:
✓ Concurrent Updates - Prevent Data Loss (2 tests)
✓ Cache Management - No Stale Data (2 tests)
✓ Retry Logic - Handle Conflicts (2 tests)
✓ Bonus: Integration Test (if time)

Test Suites: 1 passed
Tests: 6 passed
```

### Quick Manual Test:
```bash
# Candidate can also run:
npm test -- --verbose

# Shows detailed output of what's happening
```

---

## 💾 Phase 4: Commit and Submit (3 minutes)

### Step 1: Stage Changes
```bash
# Candidate checks what they changed
git status
git diff src/problem-simplified.ts

# Should only show changes to problem file
```

### Step 2: Commit Solution
```bash
# Add changes
git add src/problem-simplified.ts

# Commit with descriptive message
git commit -m "Fix template sync issues: add version checking, cache invalidation, and retry logic

- Implemented optimistic locking with version numbers
- Clear cache after successful updates
- Added retry mechanism with 2 attempts max
- All tests passing"
```

### Step 3: Push to Fork (Optional)
```bash
# If candidate forked the repo:
git push origin main

# Or create a branch:
git checkout -b solution-[candidate-name]
git push origin solution-[candidate-name]
```

### Step 4: Share Solution
**Options for submission:**
1. Share GitHub fork link
2. Create a patch file: `git format-patch -1 HEAD`
3. Copy/paste the solution file
4. Screen share the working tests

---

## 🎯 Phase 5: Evaluation Checklist

### Interviewer Evaluates:

#### Core Functionality (6 points)
- [ ] **Concurrent updates handled** (2 pts)
  - Version checking implemented?
  - Conflicts detected?

- [ ] **Cache properly managed** (2 pts)
  - Cache cleared after updates?
  - No stale data returned?

- [ ] **Retry logic works** (2 pts)
  - Retries on failure?
  - Doesn't retry forever?

#### Code Quality (2 points)
- [ ] **Clean code** (1 pt)
  - Readable variable names?
  - Logical flow?

- [ ] **Error handling** (1 pt)
  - Graceful failures?
  - No unhandled exceptions?

#### Problem Solving (2 points)
- [ ] **Understanding** (1 pt)
  - Identified issues quickly?
  - Asked good questions?

- [ ] **Approach** (1 pt)
  - Systematic debugging?
  - Used tests to verify?

### Scoring:
- **9-10**: All tests pass, clean code, good approach
- **7-8**: Most tests pass, decent solution
- **5-6**: Some tests pass, understanding shown
- **3-4**: Attempted solution, struggles visible

---

## 💬 Phase 6: Discussion (10-15 minutes)

### Questions to Ask:

#### Understanding Check:
1. "Walk me through your solution for preventing data loss"
2. "Why did you choose this approach for cache management?"
3. "What happens if 10 users update simultaneously?"

#### Design Decisions:
1. "What are the trade-offs of your retry strategy?"
2. "How would you handle merge conflicts instead of last-write-wins?"
3. "What monitoring would you add in production?"

#### Scaling Questions:
1. "How would this work with 1000 concurrent users?"
2. "What if templates were 10MB each?"
3. "How would you handle network failures?"

#### Experience Questions:
1. "Have you dealt with similar race conditions before?"
2. "What's the hardest bug you've debugged?"
3. "How do you typically handle caching in your projects?"

---

## 📊 Final Evaluation Matrix

| Aspect | Poor (1-2) | Fair (3-4) | Good (5-6) | Excellent (7-8) | Outstanding (9-10) |
|--------|-----------|------------|------------|-----------------|-------------------|
| **Problem Solving** | Couldn't identify issues | Found some issues | Fixed 2/3 issues | Fixed all issues | Elegant solution |
| **Code Quality** | Messy, doesn't work | Works but unclear | Clean, works | Very clean | Production-ready |
| **Testing** | Didn't use tests | Ran tests once | Used tests to verify | Test-driven | Added own tests |
| **Communication** | Silent, confused | Some explanation | Clear explanation | Good discussion | Teaches interviewer |
| **Time Management** | Didn't finish | Rushed solution | Completed on time | Time to refine | Time for bonus |

---

## 🎬 Sample Timeline

| Time | Candidate Action | Interviewer Notes |
|------|-----------------|-------------------|
| 0:00 | Clones repo, reads problem | Observe understanding |
| 0:05 | Identifies 3 issues in code | ✓ Good analysis |
| 0:10 | Implements version checking | Note approach |
| 0:15 | Tests concurrent updates | ✓ Uses tests |
| 0:20 | Fixes cache invalidation | Check completeness |
| 0:25 | Adds retry logic | Evaluate elegance |
| 0:30 | All tests passing | ✓ Core complete |
| 0:35 | Cleans up code | Good practices |
| 0:40 | Commits with good message | Professional |
| 0:45 | Discusses trade-offs | Strong understanding |

---

## 🚨 Red Flags to Watch For

- **Never runs tests** → Doesn't verify work
- **Changes test files** → Trying to cheat
- **Over-engineers** → Adds unnecessary complexity
- **Copy-pastes from internet** → Without understanding
- **Gives up quickly** → Low resilience
- **Ignores hints in code** → Poor attention to detail

## 💚 Green Flags to Notice

- **Reads tests first** → Understands requirements
- **Incremental progress** → Methodical approach
- **Tests after each change** → Validates work
- **Asks clarifying questions** → Ensures understanding
- **Explains while coding** → Clear thinking
- **Finds simpler solution** → Pragmatic mindset

---

## 📝 Post-Interview Notes Template

```markdown
Candidate: [Name]
Date: [Date]
Position: [Level]

Technical Score: _/10
- Concurrent Updates: _/2
- Cache Management: _/2
- Retry Logic: _/2
- Code Quality: _/2
- Problem Solving: _/2

Strengths:
-
-

Areas for Improvement:
-
-

Hire Recommendation: [Yes/No/Maybe]
Notes:
```