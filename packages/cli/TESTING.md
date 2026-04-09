# Testing the CLI locally

## The Problem

The CLI had multiple bugs when running `init` in an empty directory:

1. **Wrong directory for components**: `addCommand` used `process.cwd()` instead of the project directory
2. **Wrong directory for dependencies**: `installWithRetry` used `process.cwd()` instead of the project directory  
3. **Wrong directory for templates**: `installTemplates` used `process.cwd()` internally
4. **Silent failures**: Errors were swallowed without showing what went wrong

## The Fixes

### 1. Fixed `addCommand` (src/commands/add.ts)

- Added `cwd` option to `AddOptions` interface
- Use `options.cwd || process.cwd()` instead of just `process.cwd()`

### 2. Fixed `installTemplates` (src/utils/templates.ts)

- Added `projectCwd` parameter to `installTemplates` function
- Pass `cwd` through to `installSaasTemplate`, `installApiTemplate`, `installUsageTemplate`
- Pass `cwd` to all `addCommand` calls

### 3. Fixed `installWithRetry` (src/commands/init.ts)

- Added `projectCwd` parameter
- Use `projectCwd || process.cwd()` for the install directory
- Added error logging for each failed attempt

### 4. Updated init.ts

- Pass `cwd` to `installTemplates`
- Pass `cwd` to both `installWithRetry` calls
- Added debug logging: `Debug: cwd=..., isEmptyDir=..., hasPackageJson=...`

## How to Test Locally

### Option 1: Link the local CLI

```bash
# From the monetize root
cd packages/cli
npm link

# In your test directory
mkdir test-app
cd test-app
billing init
```

### Option 2: Use the local path directly

```bash
# Create test directory
mkdir test-app
cd test-app

# Run the local CLI using node
node /path/to/monetize/packages/cli/dist/index.js init

# Or use npx with the local path
npx /path/to/monetize/packages/cli/dist/index.js init
```

### Option 3: Install from local tarball

```bash
# From packages/cli directory
npm pack

# In your test directory
npm install -g /path/to/drew-billing-cli-1.1.1.tgz
billing init
```

## What to Verify

1. **Project creation**: Should create Next.js app in current directory (not subdirectory)
2. **Framework detection**: Should show "Detected: nextjs" not "unknown"
3. **Dependencies**: Should install without errors (or show actual error messages)
4. **Components**: Should create `components/billing/` with all component files
5. **Pages**: Should create `app/pricing/page.tsx`, `app/billing/page.tsx`, etc.
6. **Environment**: Should create `.env.local` with Stripe keys

## Debugging

If things still fail, check:

1. **Debug output**: Look for `Debug: cwd=..., isEmptyDir=..., hasPackageJson=...` at the start
2. **Install errors**: Look for detailed error messages from npm/bun/pnpm/yarn
3. **Directory contents**: Check what's actually in the directory after each step

## Common Issues

### "Detected: unknown"

This means the directory wasn't empty OR already had a package.json. Check the debug output.

### "Failed to install dependencies"

The debug output now shows the actual error from npm/pnpm/yarn/bun. Check your internet connection or registry access.

### Components not created

Check if `components/billing/` directory was created and what files are in it.
