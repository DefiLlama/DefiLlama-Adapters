const { spawn } = require('child_process')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const DEFAULT_ADAPTERS = {
  // helper → solana.js
  solana:   ['projects/kyros/index.js','projects/solayer-ssol/index.js','projects/parrot.js'],
  eclipse:  ['projects/astrolend/index.js', 'projects/umbra/index.js', 'projects/neptune-protocol/index.js'],
  // helper → sui.js
  sui:      ['projects/suilend/index.js', 'projects/typus-finance/index.js', 'projects/nemo/index.js'],
  // helper → starknet.js
  starknet: ['projects/nostra/index.js', 'projects/endur/index.js', 'projects/protoss-dex/index.js'],
  // helper → aptos.js
  aptos:    ['projects/echo-lending/index.js', 'projects/aries-markets/index.js', 'projects/thalaswap-v2/index.js'],
  move:     ['projects/moveposition/index.js', 'projects/canopy/index.js', 'projects/yuzu/index.js'],
}

async function main() {
  let selectedAdapters;

  const cliChains = process.argv.slice(2);

  if (cliChains.length === 0) {
    selectedAdapters = Object.entries(DEFAULT_ADAPTERS);
  } else {
    selectedAdapters = Object.entries(DEFAULT_ADAPTERS)
      .filter(([chain]) => cliChains.includes(chain));
    if (selectedAdapters.length === 0) {
      console.error('❌  No valid chain provided. Choose from:',
        Object.keys(DEFAULT_ADAPTERS).join(', '));
      process.exit(1);
    }
  }

  const repoRoot = path.resolve(__dirname, '../../');
  const testRunner = path.join(repoRoot, 'test.js');

  for (const [chain, list] of selectedAdapters) {
    for (const relPath of list) {
      const absPath = path.join(repoRoot, relPath);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`▶  TEST [${chain}] ${absPath}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      await new Promise((resolve) => {
        const child = spawn('node', [testRunner, absPath], {
          stdio: 'inherit',
          env: process.env,
        });
        child.on('exit', resolve);
      });
    }
  }
}

main();