/**
 * Shared build script for all packages.
 * Uses Bun for ESM/CJS bundling and tsc for type declarations.
 *
 * Usage: bun run scripts/build.ts
 * Run from within a package directory.
 */
import { execSync } from 'child_process';
import { rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const cwd = process.cwd();
const pkg = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf-8'));
const entrypoint = resolve(cwd, 'src/index.ts');

if (!existsSync(entrypoint)) {
  console.error(`Entry point not found: ${entrypoint}`);
  process.exit(1);
}

// Collect all external dependencies (libraries should not bundle deps)
const externals: string[] = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.optionalDependencies || {}),
];
const externalFlags = externals.map((dep) => `--external=${dep}`).join(' ');

// Clean dist
const distDir = resolve(cwd, 'dist');
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true });
}

console.log(`Building ${pkg.name}...`);

try {
  // Build ESM with Bun
  console.log('  → ESM bundle');
  execSync(
    `bun build ./src/index.ts --outdir ./dist/esm --target=node --format=esm --splitting --sourcemap=external ${externalFlags}`,
    { cwd, stdio: 'inherit' },
  );

  // Build CJS with Bun (no splitting — CJS doesn't support it)
  console.log('  → CJS bundle');
  execSync(
    `bun build ./src/index.ts --outdir ./dist/cjs --target=node --format=cjs --sourcemap=external ${externalFlags}`,
    { cwd, stdio: 'inherit' },
  );

  // Write CJS package.json so Node resolves .js files as CommonJS
  // even when the parent package has "type": "module"
  const cjsDir = resolve(cwd, 'dist/cjs');
  mkdirSync(cjsDir, { recursive: true });
  writeFileSync(
    resolve(cjsDir, 'package.json'),
    JSON.stringify({ type: 'commonjs' }, null, 2) + '\n',
  );

  // Build type declarations with tsc
  console.log('  → Type declarations');
  execSync(`npx tsc --project ./tsconfig.declaration.json`, {
    cwd,
    stdio: 'inherit',
  });
} catch (error) {
  console.error(`✗ ${pkg.name} build failed`);
  process.exit(1);
}

console.log(`✓ ${pkg.name} built successfully`);
