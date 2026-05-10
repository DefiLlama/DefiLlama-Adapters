require('dotenv').config();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { getEnv } = require('../../projects/helper/env');

const REGISTRY_DIR = path.join(__dirname, '../../registries');
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$|^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Keys that identify a tracked contract
const KEYS = new Set(['factory', 'comptroller', 'masterchef', 'vault', 'registry', 'address']);

const IGNORED = new Set([
  '0x7C10a3b7EcD42dd7D79C0b9d58dDB812f92B574A' // DogeShrek rebranded to ChewySwap and was listed again; we cant fix by backfilling since dogechain's RPC fails on the necessary historical queries
].map(a => a.toLowerCase()));

// Based on defillama-server/defi/src/utils/discord.ts
async function sendDiscord(message, formatted = true) {
  const webhookUrl = getEnv('TEAM_WEBHOOK');
  if (!webhookUrl) {
    throw new Error(`Missing TEAM_WEBHOOK env var. Could not send: "${message}"`);
  }
  const formattedMessage = formatted ? '```\n' + message + '\n```' : message;
  if (formattedMessage.length >= 2000) {
    const lines = message.split('\n');
    if (lines.length <= 2) throw new Error('Lines are too long, reaching infinite recursivity');
    const mid = Math.round(lines.length / 2);
    await sendDiscord(lines.slice(0, mid).join('\n'), formatted);
    await sendDiscord(lines.slice(mid).join('\n'), formatted);
    return;
  }
  await axios.post(`${webhookUrl}?wait=true`, { content: formattedMessage }, {
    headers: { 'Content-Type': 'application/json' },
  });
}

function addIfAddress(value, found) {
  if (typeof value === 'string' && ADDRESS_RE.test(value)) found.add(value.toLowerCase());
}

function extractTrackedAddresses(chainConfig, found = new Set()) {
  // Shorthand: `chain: '0x...'` — the chain value itself is the factory address
  if (typeof chainConfig === 'string') {
    addIfAddress(chainConfig, found);
    return found;
  }
  // Array form: `chain: [{ comptroller: '0x...' }, ...]`
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

function formatDuplicates(duplicates) {
  const entries = Object.entries(duplicates);
  if (!entries.length) return null;
  const lines = [`Found ${entries.length} duplicate registry entries:`, ''];
  for (const [key, protocols] of entries) lines.push(`${key}\n  → ${protocols}`);
  return lines.join('\n');
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

    const addressMap = {};
    for (const [protocol, config] of Object.entries(configs)) {
      if (typeof config !== 'object' || config === null) continue;
      for (const [chain, chainConfig] of Object.entries(config)) {
        for (const addr of extractTrackedAddresses(chainConfig)) {
          const key = `${chain}:${addr}`;
          if (!addressMap[key]) addressMap[key] = [];
          if (!addressMap[key].includes(protocol)) addressMap[key].push(protocol);
        }
      }
    }

    for (const [key, protocols] of Object.entries(addressMap)) {
      if (protocols.length > 1) {
        const addr = key.split(':')[1];
        if (IGNORED.has(addr)) continue;
        duplicates[`${name} ${key}`] = protocols.join(', ');
      }
    }
  }

  console.table(Object.entries(duplicates));

  const message = formatDuplicates(duplicates);
  if (message) await sendDiscord(message);
  else console.log('No duplicate registry entries found.');
}

run().catch(async (e) => {
  console.error(e);
  try {
    await sendDiscord(`check-registries-duplicates failed: ${e.message}`);
  } catch (sendErr) {
    console.error('Also failed to send discord error:', sendErr.message);
  }
  process.exitCode = 1;
});
