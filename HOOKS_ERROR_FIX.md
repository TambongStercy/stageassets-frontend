# React Hooks Error Fix - SpeakerPortalPage

## Error Description
**Error:** "React has detected a change in the order of Hooks called by SpeakerPortalPage. This will lead to bugs and errors if not fixed."

**Location:** SpeakerPortalPage.tsx, line 100

**Cause:** Violating the [Rules of Hooks](https://react.dev/link/rules-of-hooks) by conditionally calling `useQuery` inside a function.

## The Problem

### Original Code (INCORRECT):
```typescript
// ❌ WRONG: Calling useQuery inside a function
const getVersionHistoryQuery = (requirementId: number) => {
  return useQuery({
    queryKey: ['version-history', speaker?.id, requirementId],
    queryFn: () => submissionsService.getVersionHistory(speaker!.id, requirementId),
    enabled: !!speaker && viewingVersionHistory === requirementId,
  });
};

// Used in JSX like this:
{viewingVersionHistory === requirement.id && (() => {
  const versionHistoryQuery = getVersionHistoryQuery(requirement.id);
  return versionHistoryQuery.isLoading ? (
    // Loading UI
  ) : versionHistoryQuery.data ? (
    // Data UI
  ) : null;
})()}
```

**Why this is wrong:**
1. `useQuery` is a React Hook and must be called at the **top level** of a component
2. Hooks cannot be called inside:
   - ❌ Conditionals (if statements)
   - ❌ Loops (for, while)
   - ❌ Nested functions
   - ❌ Callbacks
3. The IIFE (Immediately Invoked Function Expression) `(() => { ... })()` creates a new function scope, violating the rules
4. This causes React to lose track of hook ordering between renders, leading to crashes

## The Solution

### Fixed Code (CORRECT):
```typescript
// ✅ CORRECT: Call useQuery at top level, use 'enabled' to control when it runs
const { data: versionHistory, isLoading: versionHistoryLoading } = useQuery({
  queryKey: ['version-history', speaker?.id, viewingVersionHistory],
  queryFn: () => {
    if (!speaker?.id || !viewingVersionHistory) {
      return Promise.resolve([]);
    }
    return submissionsService.getVersionHistory(speaker.id, viewingVersionHistory);
  },
  enabled: !!speaker && !!viewingVersionHistory,
});

// Used in JSX like this:
{viewingVersionHistory === requirement.id && (
  versionHistoryLoading ? (
    // Loading UI
  ) : versionHistory && versionHistory.length > 0 ? (
    // Data UI
  ) : null
)}
```

**Why this works:**
1. ✅ `useQuery` called at top level of component
2. ✅ Hook is always called in the same order
3. ✅ The `enabled` option controls when the query runs (only when `viewingVersionHistory` is set)
4. ✅ React Query handles caching and refetching automatically
5. ✅ No IIFE needed - direct conditional rendering

## Key Changes

### 1. Moved Hook to Top Level
**Before:**
```typescript
const getVersionHistoryQuery = (requirementId: number) => {
  return useQuery({ ... }); // ❌ Hook inside function
};
```

**After:**
```typescript
const { data: versionHistory, isLoading: versionHistoryLoading } = useQuery({
  // ✅ Hook at top level
  enabled: !!speaker && !!viewingVersionHistory, // Only runs when needed
});
```

### 2. Used Query Key Based on State
**Before:**
```typescript
queryKey: ['version-history', speaker?.id, requirementId] // requirementId from parameter
```

**After:**
```typescript
queryKey: ['version-history', speaker?.id, viewingVersionHistory] // viewingVersionHistory from state
```

This works because:
- React Query automatically refetches when the query key changes
- When `viewingVersionHistory` changes, the query fetches new data
- When `viewingVersionHistory` is null, the query is disabled

### 3. Simplified JSX Rendering
**Before:**
```typescript
{viewingVersionHistory === requirement.id && (() => {
  const versionHistoryQuery = getVersionHistoryQuery(requirement.id);
  return versionHistoryQuery.isLoading ? (
    // ...
  ) : versionHistoryQuery.data ? (
    // ...
  ) : null;
})()}
```

**After:**
```typescript
{viewingVersionHistory === requirement.id && (
  versionHistoryLoading ? (
    // ...
  ) : versionHistory && versionHistory.length > 0 ? (
    // ...
  ) : null
)}
```

## React Hooks Rules Reminder

### The Rules of Hooks:
1. **Only call hooks at the top level**
   - Don't call hooks inside loops, conditions, or nested functions
   - Ensures hooks are called in the same order every render

2. **Only call hooks from React functions**
   - Call from React function components
   - Call from custom hooks (functions starting with "use")

### Common Violations:

#### ❌ BAD: Hook inside if statement
```typescript
if (condition) {
  const data = useQuery(...); // WRONG
}
```

#### ✅ GOOD: Use 'enabled' option
```typescript
const data = useQuery({
  ...
  enabled: condition, // CORRECT
});
```

#### ❌ BAD: Hook inside loop
```typescript
items.map(item => {
  const data = useQuery(...); // WRONG
});
```

#### ✅ GOOD: Call hook at top level
```typescript
const queries = useQueries(
  items.map(item => ({
    queryKey: ['item', item.id],
    queryFn: () => fetchItem(item.id),
  }))
); // CORRECT
```

#### ❌ BAD: Hook inside callback/function
```typescript
const fetchData = () => {
  const data = useQuery(...); // WRONG
};
```

#### ✅ GOOD: Hook at component level
```typescript
const { data, refetch } = useQuery(...); // CORRECT

const fetchData = () => {
  refetch(); // Call refetch, not the hook
};
```

## Testing the Fix

### Before Fix:
```
❌ Error: Rendered more hooks than during the previous render
❌ React has detected a change in the order of Hooks
❌ App crashes when clicking "View History"
```

### After Fix:
```
✅ No hook ordering errors
✅ Version history loads correctly
✅ Can open/close version history without errors
✅ React Query caching works as expected
```

## Additional Notes

### Why React Query's 'enabled' Option is Perfect for This:
- Prevents unnecessary network requests
- Hooks still called in consistent order
- Query only runs when data is needed
- Automatic caching and refetching
- Clean, readable code

### Performance Benefits:
- Query result cached by React Query
- No refetch when switching between requirements if data exists
- Background refetching for stale data
- Optimistic UI updates

## Related Resources
- [Rules of Hooks - React Docs](https://react.dev/link/rules-of-hooks)
- [React Query - Conditional Queries](https://tanstack.com/query/latest/docs/react/guides/disabling-queries)
- [Why Hook Order Matters](https://react.dev/learn/state-a-components-memory#how-does-react-know-which-state-to-return)

---

**Date Fixed:** January 2025
**Impact:** Critical bug fix - prevents app crashes
**Test Status:** ✅ Verified working
