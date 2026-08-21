require('dotenv').config();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { getEnv } = require('../../projects/helper/env');

const REGISTRY_DIR = path.join(__dirname, '../../registries');
const CEX_INDEX = path.join(__dirname, '../../cex/index.js');
const SUMTOKENS_INDEX = path.join(__dirname, '../../registries/sumTokens.js');
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$|^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Keys that identify a tracked contract
const KEYS = new Set(['factory', 'comptroller', 'masterchef', 'vault', 'registry', 'address']);

// Keys that identify an owner/wallet (cex + sumTokens)
const OWNER_KEYS = new Set(['owner', 'owners', 'solOwners', 'tokenAccounts']);

// Metadata keys to ignore
const META = new Set(['methodology', 'start', 'timetravel', 'hallmarks', 'doublecounted', 'misrepresentedTokens']);

const IGNORED = new Set([
  '0x7C10a3b7EcD42dd7D79C0b9d58dDB812f92B574A' // DogeShrek rebranded to ChewySwap and was listed again; we cant fix by backfilling since dogechain's RPC fails on the necessary historical queries
].map(a => a.toLowerCase()));

// e.g. { 'some-cex': ['0xabc...'], ... }
const IGNORED_OWNERS = {};

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

function collectOwnerAddrs(value, found) {
  if (typeof value === 'string') addIfAddress(value, found);
  else if (Array.isArray(value)) value.forEach(v => collectOwnerAddrs(v, found));
  // functions (dynamic owner lists) and objects are ignored for now
}

// Pull owner addresses from a chain config, they can sit at the chain level
// or nested inside a tvl/staking/pool2/
function extractOwners(node, found = new Set()) {
  if (!node || typeof node !== 'object') return found;
  if (Array.isArray(node)) { node.forEach(item => extractOwners(item, found)); return found; }
  for (const [key, value] of Object.entries(node)) {
    if (OWNER_KEYS.has(key)) collectOwnerAddrs(value, found);
    else if (key === 'tokensAndOwners' && Array.isArray(value)) {
      for (const pair of value) if (Array.isArray(pair)) addIfAddress(pair[1], found);
    } else if (value && typeof value === 'object') {
      extractOwners(value, found);
    }
  }
  return found;
}

function loadRawConfigs(filePath) {
  return require(filePath)._rawConfigs;
}

function findContractDuplicates() {
  const registryFiles = fs.readdirSync(REGISTRY_DIR)
    .filter(f => f.endsWith('.js') && !['index.js', 'utils.js', 'sumTokens.js'].includes(f))
    .map(f => ({ name: f, fullPath: path.join(REGISTRY_DIR, f) }));

  const duplicates = {};

  for (const { name, fullPath } of registryFiles) {
    const configs = loadRawConfigs(fullPath);
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

  return duplicates;
}

// Find owners listed under more than one protocol within a registry (cex or sumTokens)
function findOwnerDuplicates(rawConfigs) {
  if (!rawConfigs || typeof rawConfigs !== 'object') return {};

  const ownerMap = {}; // `${chain}:${owner}` -> [protocols]
  for (const [protocol, config] of Object.entries(rawConfigs)) {
    if (!config || typeof config !== 'object') continue;
    const ignoredForProto = new Set((IGNORED_OWNERS[protocol] || []).map(a => a.toLowerCase()));
    for (const [chain, chainConfig] of Object.entries(config)) {
      if (META.has(chain)) continue;
      for (const owner of extractOwners(chainConfig)) {
        if (ignoredForProto.has(owner)) continue;
        const key = `${chain}:${owner}`;
        if (!ownerMap[key]) ownerMap[key] = [];
        if (!ownerMap[key].includes(protocol)) ownerMap[key].push(protocol);
      }
    }
  }

  const duplicates = {};
  for (const [key, protocols] of Object.entries(ownerMap)) {
    if (protocols.length > 1) duplicates[key] = protocols.join(', ');
  }
  return duplicates;
}

function formatSection(title, duplicates) {
  const entries = Object.entries(duplicates);
  if (!entries.length) return null;
  const lines = [`${title} (${entries.length}):`, ''];
  for (const [key, protocols] of entries) lines.push(`${key}\n  -> ${protocols}`);
  return lines.join('\n');
}

async function run() {
  const contractDups = findContractDuplicates();
  const cexOwnerDups = findOwnerDuplicates(loadRawConfigs(CEX_INDEX));
  const sumTokensOwnerDups = findOwnerDuplicates(loadRawConfigs(SUMTOKENS_INDEX));

  const sections = [
    formatSection('Registry tracked-contract duplicates', contractDups),
    formatSection('CEX owner duplicates', cexOwnerDups),
    formatSection('sumTokens owner duplicates', sumTokensOwnerDups),
  ].filter(Boolean);

  if (!sections.length) {
    console.log('No duplicate registry entries found.');
    return;
  }

  const message = sections.join('\n\n');
  console.log(message);
  await sendDiscord(message);
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
