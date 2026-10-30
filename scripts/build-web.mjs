import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const outputDir = resolve(projectRoot, process.argv[2] ?? 'dist');
const expoCli = resolve(projectRoot, 'node_modules', 'expo', 'bin', 'cli');

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const result = spawnSync(process.execPath, [expoCli, 'export', '--platform', 'web', '--output-dir', outputDir], {
  cwd: projectRoot,
  stdio: 'inherit',
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

const publicDir = resolve(projectRoot, 'public');
if (existsSync(publicDir)) cpSync(publicDir, outputDir, { recursive: true });

console.log(`PWA exported to ${outputDir}`);
