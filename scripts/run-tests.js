const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const coverageIndex = args.indexOf('--coverage');
const coverageEnabled = coverageIndex !== -1;

if (coverageEnabled) {
    args.splice(coverageIndex, 1);
}

const vitest = path.join(root, 'node_modules', 'vitest', 'vitest.mjs');
const command = coverageEnabled
    ? [
          path.join(root, 'node_modules', 'c8', 'bin', 'c8.js'),
          '--config',
          path.join(root, 'c8.config.json'),
          process.execPath,
          vitest,
          'run',
          ...args
      ]
    : [vitest, 'run', ...args];

const result = spawnSync(process.execPath, command, {
    cwd: root,
    env: process.env,
    stdio: 'inherit'
});

process.exit(result.status ?? 1);
