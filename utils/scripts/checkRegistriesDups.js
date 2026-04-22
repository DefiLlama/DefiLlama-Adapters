const path = require('path');
const fs = require('fs');
const sdk = require('@defillama/sdk');
const { getEnv } = require('../../projects/helper/env');

const Bucket = 'tvl-adapter-cache';
const REGISTRY_DIR = path.join(__dirname, '../../registries');
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$|^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const NON_CHAIN_KEYS = new Set(['methodology', 'misrepresentedTokens', 'doublecounted', 'hallmarks', '_options']);

// Keys that identify a tracked contract
const KEYS = new Set(['factory', 'comptroller', 'masterchef', 'vault', 'registry']);

function addIfAddress(value, found) {
  if (typeof value === 'string' && ADDRESS_RE.test(value)) found.add(value.toLowerCase());
}

function extractTrackedAddresses(chainConfig, found = new Set()) {
  // Shorthand: `chain: '0x...'` — the chain value itself is the factory address
  if (typeof chainConfig === 'string') {
    addIfAddress(chainConfig, found);
    return found;
  }
  // Array form: `chain: [{ comptroller: '0x...' }, ...]` — recurse into each
  if (Array.isArray(chainConfig)) {
    chainConfig.forEach(item => extractTrackedAddresses(item, found));
    return found;
  }
  if (!chainConfig || typeof chainConfig !== 'object') return found;

  for (const [key, value] of Object.entries(chainConfig)) {
    if (KEYS.has(key)) addIfAddress(value, found);
  }
  return found;
}

function loadRawConfigs(filePath) {
  return require(filePath)._rawConfigs;
}

async function run() {
  const registryFiles = fs.readdirSync(REGISTRY_DIR)
    .filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'utils.js')
    .map(f => ({ name: f, fullPath: path.join(REGISTRY_DIR, f) }));

  const duplicates = {};

  for (const { name, fullPath } of registryFiles) {
    let configs;
    try {
      configs = loadRawConfigs(fullPath);
    } catch {
      console.warn(`Skipping ${name} (could not load)`);
      continue;
    }

    if (!configs || typeof configs !== 'object') continue;

    // scoped to this file — same address across registries is not a duplicate
    const addressMap = {};
    for (const [protocol, config] of Object.entries(configs)) {
      if (typeof config !== 'object' || config === null) continue;
      for (const [chain, chainConfig] of Object.entries(config)) {
        if (NON_CHAIN_KEYS.has(chain)) continue;
        for (const addr of extractTrackedAddresses(chainConfig)) {
          const key = `${chain}:${addr}`;
          if (!addressMap[key]) addressMap[key] = [];
          if (!addressMap[key].includes(protocol)) addressMap[key].push(protocol);
        }
      }
    }

    for (const [key, protocols] of Object.entries(addressMap)) {
      if (protocols.length > 1) duplicates[`${name} ${key}`] = protocols.join(', ');
    }
  }

  if (getEnv('STORE_IN_R2')) {
    try {
      await sdk.cache.writeCache(`${Bucket}/registry-duplicates.json`, duplicates);
      console.log('data written to s3 bucket');
    } catch (e) {
      sdk.log('failed to write data to s3 bucket: ');
      sdk.log(e);
    }
    return;
  }

  console.table(Object.entries(duplicates));
}

run().catch(console.error).then(() => process.exit(0));
