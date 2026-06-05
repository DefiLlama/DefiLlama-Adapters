'use strict';

const https = require('https');

const RPC = 'https://rpc.cookiescan.io';
const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_2022    = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

// CookieBox
const COOKIEBOX_DAMM_VAULT_AUTH = '8WYfVSBcP3T1amRNmTnLfzYd44VDjGpw1jZxrEL8638o';
const COOKIEBOX_DBC_VAULT_AUTH  = 'HSYMkG6iYhdqAgLnZQKGkW5Ce5N9zYq1F3dd6m76y5Ki';
const COOKIEBOX_CLMM_PROGRAM    = 'CLMMmWqTtyNSomqXP3kETJy2SGKPdr31USsm4GfbLyKs';

// CookieSwap
const COOKIESWAP_BAMM_PROGRAM  = 'WTzkPUoprVx7PDc1tfKA5sS7k1ynCgU89WtwZhksHX5';
const COOKIESWAP_CPAMM_PROGRAM = 'xYBN2zddsqSy41tg1yD9nJScCmqquZnHUyzXBfLEqC8';

// BangSwap
const BANGSWAP_CPAMM_PROGRAM = 'DYgGxvJD8GTYQSGFmT4RUab5TJ7W3m7Vrbg2UueNzAq8';

const NATIVE_MINT    = 'So11111111111111111111111111111111111111112';
const COOK_ON_SOLANA = 'solana:36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1';

const RPC_TIMEOUT_MS = 30000;

function rpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
    const req = https.request({
      hostname: new URL(RPC).hostname,
      path: '/',
      method: 'POST',
      port: 443,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) throw new Error(`RPC error ${method}: ${JSON.stringify(parsed.error)}`);
          resolve(parsed);
        } catch (e) { reject(e); }
      });
    });
    req.setTimeout(RPC_TIMEOUT_MS, () => { req.destroy(new Error(`RPC timeout: ${method}`)); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function fetchDecimals(mints) {
  const decimalsMap = { [NATIVE_MINT]: 9 };
  const unknown = mints.filter((m) => decimalsMap[m] === undefined);
  if (!unknown.length) return decimalsMap;

  const CHUNK = 100;
  for (let i = 0; i < unknown.length; i += CHUNK) {
    const chunk = unknown.slice(i, i + CHUNK);
    const res = await rpcCall('getMultipleAccounts', [chunk, { encoding: 'base64', dataSlice: { offset: 44, length: 1 } }]);
    (res.result?.value || []).forEach((acc, idx) => {
      const mint = chunk[idx];
      if (!acc) { decimalsMap[mint] = 0; return; }
      try { decimalsMap[mint] = Buffer.from(acc.data[0], 'base64')[0]; }
      catch (_) { decimalsMap[mint] = 0; }
    });
  }
  return decimalsMap;
}

function tokenKey(mint) {
  if (mint === NATIVE_MINT) return COOK_ON_SOLANA;
  return `cookiechain:${mint}`;
}

async function getTokenAccountsByOwner(owner, programId) {
  const res = await rpcCall('getTokenAccountsByOwner', [
    owner, { programId }, { encoding: 'jsonParsed' },
  ]);
  return res.result?.value || [];
}

async function getProgramAccounts(programId) {
  const res = await rpcCall('getProgramAccounts', [programId, { encoding: 'base64', dataSlice: { offset: 0, length: 0 } }]);
  return (res.result || []).map((a) => a.pubkey);
}

async function sumVaultAuth(owner, raw) {
  for (const programId of [TOKEN_PROGRAM, TOKEN_2022]) {
    const accounts = await getTokenAccountsByOwner(owner, programId);
    for (const acc of accounts) {
      const info = acc.account.data.parsed.info;
      const amount = BigInt(info.tokenAmount.amount);
      if (amount === 0n) continue;
      raw[info.mint] = (raw[info.mint] || 0n) + amount;
    }
  }
}

async function sumProgramVaults(programId, raw) {
  const pools = await getProgramAccounts(programId);
  const seenOwners = new Set();

  for (const pool of pools) {
    const sigs = await rpcCall('getSignaturesForAddress', [pool, { limit: 1 }]);
    const sig = sigs.result?.[0]?.signature;
    if (!sig) continue;

    const tx = await rpcCall('getTransaction', [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]);
    const pre = tx.result?.meta?.preTokenBalances || [];

    for (const b of pre) {
      const owner = b.owner;
      if (!owner || seenOwners.has(owner)) continue;
      if (owner === TOKEN_PROGRAM || owner === TOKEN_2022 || owner === '11111111111111111111111111111111') continue;
      seenOwners.add(owner);
      await sumVaultAuth(owner, raw);
    }
  }
}

async function tvl() {
  const raw = {};

  await sumVaultAuth(COOKIEBOX_DAMM_VAULT_AUTH, raw);
  await sumVaultAuth(COOKIEBOX_DBC_VAULT_AUTH, raw);
  await sumProgramVaults(COOKIEBOX_CLMM_PROGRAM, raw);
  await sumProgramVaults(COOKIESWAP_BAMM_PROGRAM, raw);
  await sumProgramVaults(COOKIESWAP_CPAMM_PROGRAM, raw);
  await sumProgramVaults(BANGSWAP_CPAMM_PROGRAM, raw);

  const mints = Object.keys(raw);
  const decimalsMap = await fetchDecimals(mints);

  const balances = {};
  for (const mint of mints) {
    const decimals = decimalsMap[mint] ?? 0;
    const human = Number(raw[mint]) / Math.pow(10, decimals);
    if (human < 0.000001) continue;
    const key = tokenKey(mint);
    balances[key] = (balances[key] || 0) + human;
  }

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated by summing token balances held in liquidity pool vault accounts across CookieBox DAMM, CookieBox DBC, CookieBox CLMM, CookieSwap BAMM, CookieSwap CPAMM, and BangSwap CPAMM on Cookie Chain. Native wSOL is priced via the COOK token on Solana mainnet.',
  cookiechain: { tvl },
};
