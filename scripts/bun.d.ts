/**
 * Minimal Bun type declarations for the build script.
 * These scripts are executed via `bun run` which provides the Bun global.
 */

interface BunBuildConfig {
  entrypoints: string[];
  outdir: string;
  target?: 'node' | 'browser' | 'bun';
  format?: 'esm' | 'cjs' | 'iife';
  splitting?: boolean;
  sourcemap?: 'external' | 'inline' | 'none';
  external?: string[];
}

interface BunBuildOutput {
  success: boolean;
  outputs: Array<{ path: string }>;
  logs: Array<{ message: string }>;
}

interface BunSpawnSyncResult {
  exitCode: number;
  stdout: Buffer;
  stderr: Buffer;
}

interface BunSpawnSyncOptions {
  cwd?: string;
  stdio?: Array<'inherit' | 'pipe' | 'ignore'>;
}

declare const Bun: {
  build(config: BunBuildConfig): Promise<BunBuildOutput>;
  spawnSync(cmd: string[], options?: BunSpawnSyncOptions): BunSpawnSyncResult;
};
