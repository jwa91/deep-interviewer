---
name: deep-interviewer-update-check
description: Check for Node.js and npm package updates in deep-interviewer. Handles Node.js LTS major version upgrades with compatibility checks, categorizes package updates by severity (patch/minor/major), and creates update PRs. Use when user asks to check for updates, upgrade dependencies, or review what packages need updating.
---

# Deep Interviewer Update Check

Check for Node.js runtime and npm package updates, with smart handling of major version upgrades.

## Workflow

1. Run version check script
2. Analyze results by category
3. Decide update strategy
4. Apply updates and create PR (or report blockers)

## Step 1: Check Versions

```bash
uv run .agents/skills/s-deep-interviewer-update-check/deep-interviewer-update-check/scripts/fetch_versions.py .
```

Output includes:
- Node.js: current major, latest LTS, compatibility checks
- Packages: categorized as patch/minor/major updates

## Step 2: Analyze Results

### Node.js Updates

**Same major (patch):** e.g., 22.x → 22.y
- Safe to update, just change Dockerfile tag

**New LTS available:** e.g., 22 → 24
- Check `package_compatibility` in script output
- Key packages to verify: `better-sqlite3` (native), `@langchain/*`, `typescript`
- If all compatible: recommend update
- If blockers: report which packages need updates first

**EOL approaching:** (check `schedule.end` date)
- Warn user, prioritize migration planning

### Package Updates

**Patch updates:** Auto-update safe
**Minor updates:** Usually safe, quick changelog review
**Major updates:** Review changelogs carefully, especially:
- `@langchain/*` - frequent breaking changes
- `@biomejs/biome` - config format changes
- `streamdown` - API changes
- `@types/node` - **must match Node.js LTS version** (even numbers only: 22, 24, etc.). Ignore updates to odd versions (23, 25) unless upgrading Node.js runtime.

## Step 3: Decision Tree

```
No updates available?
  → Report "All up to date" and stop

Only patch updates?
  → Auto-update: pnpm update, test build, create PR

Minor updates present?
  → Update all, test build
  → If build fails: revert problematic packages, report

Major updates present?
  → Fetch changelogs for major packages
  → Check for breaking changes
  → Safe: include in update
  → Breaking: report to user with migration notes
```

## Step 4a: Apply Updates

```bash
# Create branch
git checkout -b update/deps-$(date +%Y%m%d)

# Update packages
pnpm update

# For major updates (if safe):
pnpm update <package>@latest

# For Node.js update, edit Dockerfile:
# Change: FROM node:22-alpine → FROM node:24-alpine
# (both build and production stages)

# Test build
pnpm install
pnpm build

# If build succeeds, commit
git add -A
git commit -m "Update dependencies

Node: [version change if applicable]
Major: [list major updates]
Minor: [count] packages
Patch: [count] packages"

# Push and create PR
git push -u origin update/deps-$(date +%Y%m%d)
gh pr create --title "Update dependencies" --body "..."
```

## Step 4b: Report Blockers

If updates are blocked, report to user:
1. What major updates have breaking changes
2. Specific migration steps needed
3. Which packages block Node.js upgrade
4. Recommended order of updates

## LangChain Special Handling

LangChain packages update frequently with breaking changes. For major/minor updates:

```bash
# Check changelog
gh api repos/langchain-ai/langchainjs/releases --jq '.[0:5] | .[].body' | head -100
```

Common breaking patterns:
- Import path changes
- Deprecated method removals
- Config format changes

Test thoroughly after LangChain updates.
