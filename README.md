# Template Synchronization Coding Challenge

## 🎯 Problem Statement

You're working on a field inspection management system that allows organizations to create and manage inspection templates. Recently, users have been reporting that their template changes aren't saving correctly - they make edits, see a success message, but when they refresh the page, their changes are gone or only partially saved.

After investigation, you discovered that the issue stems from a race condition between the template update operation and a background job that processes template field definitions. The template service updates the database, but there's a mismatch between what the frontend sends and what the database expects, combined with a caching layer that isn't being properly invalidated.

## 🔧 Your Task

Fix the synchronization issues in the template update system. Your solution should:

1. **Implement optimistic locking** using version numbers to prevent concurrent update conflicts
2. **Fix the cache invalidation** to ensure users always see fresh data after updates
3. **Add proper JSONB serialization** for complex nested objects (sections, field_definitions)
4. **Implement a retry mechanism** with exponential backoff for failed updates
5. **Add a mechanism to prevent the background job from overwriting recent user changes**

## 📋 Constraints

- The database schema cannot be changed (must work with existing JSONB columns)
- The solution must handle high concurrency (multiple users editing templates simultaneously)
- Updates must complete within 3 seconds for good UX
- The background job must continue running but shouldn't interfere with recent updates
- Maintain backward compatibility with existing API consumers

## 🏗️ Project Structure

```
template-sync-interview/
├── README.md                 # This file
├── src/
│   ├── problem.ts           # The broken implementation (START HERE)
│   ├── types.ts             # Type definitions
│   └── test-utils.ts        # Testing utilities
├── tests/
│   └── template.test.ts     # Test cases your solution should pass
├── package.json             # Dependencies
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Review the Problem**
   - Start by examining `src/problem.ts` - this contains the broken implementation
   - Look at `tests/template.test.ts` to understand expected behavior
   - Check `src/types.ts` for type definitions

3. **Implement Your Solution**
   - Fix the issues in `src/problem.ts`
   - Your solution should pass all tests in `tests/template.test.ts`
   - Feel free to add additional files if needed

4. **Run Tests**
   ```bash
   npm test
   ```

## 📝 Database Schema

```typescript
// Simplified template_library table structure
interface TemplateLibrary {
  id: string;                           // UUID primary key
  name: string;
  sections: any[];                       // JSONB column
  field_definitions: Record<string, any>; // JSONB column
  inspection_variants?: any[];          // JSONB column
  version: string;                       // For optimistic locking
  updated_at: string;                    // ISO timestamp
  last_user_update?: string;            // ISO timestamp
  organization_id: string;
}
```

## 🎪 Scenario to Handle

```typescript
// This test case demonstrates the problem:
async function testConcurrentUpdates() {
  const templateId = 'test-template-123';

  // User A updates sections
  const updateA = service.updateTemplate(templateId, {
    sections: [/* new sections */]
  });

  // User B updates field_definitions simultaneously
  const updateB = service.updateTemplate(templateId, {
    field_definitions: {/* new definitions */}
  });

  // Background job tries to process
  const backgroundJob = processor.processTemplateFields(templateId);

  await Promise.all([updateA, updateB, backgroundJob]);

  // Both updates should be preserved, last write wins for conflicts
  const final = await service.getTemplate(templateId);
  assert(final.sections !== null);
  assert(final.field_definitions !== null);
}
```

## 💡 Hints

<details>
<summary>Hint 1: Concurrency Control</summary>

Consider using database-level mechanisms like:
- Optimistic locking with version numbers
- PostgreSQL advisory locks
- SELECT ... FOR UPDATE statements
</details>

<details>
<summary>Hint 2: Cache Management</summary>

Think about:
- When to invalidate cache entries
- Cache-aside vs write-through patterns
- TTL strategies for cache entries
</details>

<details>
<summary>Hint 3: JSONB Handling</summary>

Remember to:
- Deep clone objects before modification
- Properly serialize nested structures
- Handle partial updates in JSONB columns
</details>

<details>
<summary>Hint 4: Coordination</summary>

Consider:
- How to track recent user updates
- Using a coordination table or Redis
- Time-based strategies for background jobs
</details>

## 🎯 Evaluation Criteria

Your solution will be evaluated on:

1. **Correctness** (40%): Does it solve the race condition and data loss issues?
2. **Robustness** (25%): How well does it handle edge cases and errors?
3. **Performance** (20%): Is the solution efficient and scalable?
4. **Code Quality** (15%): Is the code clean, readable, and maintainable?

## 🌟 Bonus Points

- Implement a queue-based system to serialize conflicting updates
- Add monitoring/logging to track synchronization issues
- Design a migration path from the current broken system to your solution
- Consider how to handle partial update failures in JSONB columns

## ⏱️ Time Expectation

- Reading and understanding: 10-15 minutes
- Implementation: 45-60 minutes
- Testing and refinement: 10-15 minutes

## 📚 Resources

- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Optimistic Locking Patterns](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)
- [Cache Invalidation Strategies](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/Strategies.html)

---

Good luck! Remember, we're looking for your problem-solving approach as much as the final solution. Feel free to add comments explaining your design decisions.