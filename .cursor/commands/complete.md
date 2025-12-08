Perform a sanity check on the code.

## Phase 1: Automated Checks (MUST PASS)

```bash
# 1. TypeScript compilation
pnpm exec tsc --noEmit

# 2. Biome lint and format check
pnpm check

# 3. Run tests
pnpm test:run
```

**If ANY of these fail:**

1. Fix the issues
2. Re-run all checks
3. Repeat until all pass

## Phase 2: Manual Code Review (Self-Check)

### TypeScript Quality

- [ ] No `any` types introduced
- [ ] All functions have explicit return types
- [ ] Types imported with `import type`
- [ ] No `@ts-ignore` or `@ts-expect-error` without comments
- [ ] Zod schemas used for external data validation

### Architecture Compliance

- [ ] No cross-feature imports (feature A → feature B)
- [ ] New shared code is truly generic (not feature-specific)
- [ ] Correct file location per architecture rules
- [ ] Public API exported through index.ts barrel

### React Standards

- [ ] "use client" only where actually required
- [ ] Props interfaces defined with `readonly`
- [ ] No inline object props or anonymous functions in JSX
- [ ] useCallback/useMemo used appropriately

### Testing

- [ ] Tests co-located with source files
- [ ] Meaningful test coverage for new code
- [ ] Tests actually test behavior, not implementation

### Code Style

- [ ] Files named in kebab-case (except components in PascalCase)
- [ ] No dead code or commented-out code
- [ ] No TODO comments without issue references

## Phase 3: Final Verification

Run this final command sequence:

```bash
# Full check sequence
pnpm exec tsc --noEmit && pnpm check && pnpm test:run && echo "✅ All checks passed"
```

## Reporting

When complete, report status:

```
## Completion Status

### Automated Checks
- TypeScript: ✅ Pass
- Biome: ✅ Pass
- Tests: ✅ Pass (X passed, Y skipped)

### Manual Review
- [ ] All checklist items verified

### Files Changed
- `src/features/example/component.tsx` - New component
- `src/features/example/component.test.tsx` - Tests
```

## What To Do If Checks Fail

### TypeScript Errors

1. Read the error message carefully
2. Fix type issues at the source, don't use `any`
3. If complex, create proper type definitions
4. Re-run `tsc --noEmit`

### Biome Errors

1. Run `pnpm check:fix` for auto-fixable issues
2. Manually fix remaining issues
3. Re-run `pnpm check`

### Test Failures

1. Read test output to understand failure
2. Determine if test or implementation is wrong
3. Fix appropriately
4. Re-run `pnpm test:run`

**NEVER mark a task complete with failing checks. NEVER skip this checklist.**
