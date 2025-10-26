// index.js — Juris Protocol adapter (uses queryContractSmart first, then fallbacks)
const { get } = require('../helper/http');
const abi = require('./abi.json');
const { queryContractSmart } = require('../helper/chain/cosmos'); // may be undefined in some runtimes

const LCD = process.env.TERRA_LCD || 'https://terra-classic-lcd.publicnode.com';
const { contracts, tokens, protocol } = abi;

// Debugging toggle: DEBUG=1 for verbose logs
const DEBUG = !!process.env.DEBUG;
const log = (...args) => { if (DEBUG) console.log('[JURIS]', ...args); };

/* -------------------------
   Helpers
   ------------------------- */

// base64 encode for cosmwasm smart queries
function b64(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

/**
 * smartQuery via LCD (robustly unwraps common shapes)
 */
async function lcdSmartQuery(contract, msgObj) {
  const url = `${LCD}/cosmwasm/wasm/v1/contract/${contract}/smart/${b64(msgObj)}`;
  try {
    const res = await get(url);
    let payload = res?.data ?? res?.result ?? res;
    if (payload && typeof payload === 'object') {
      if (payload.data && typeof payload.data === 'object' && Object.keys(payload.data).length) payload = payload.data;
      else if (payload.result && typeof payload.result === 'object' && Object.keys(payload.result).length) payload = payload.result;
    }
    log('lcdSmartQuery OK', contract, msgObj);
    return payload;
  } catch (err) {
    log('lcdSmartQuery ERROR', contract, err?.message ?? err);
    throw err;
  }
}

/**
 * Unified smartQuery: prefer queryContractSmart (helper) if available, else LCD
 * Accepts same msgObj shapes as before.
 */
async function smartQuery(contract, msgObj) {
  // try queryContractSmart helper first if available (most efficient in DFL runner)
  if (typeof queryContractSmart === 'function') {
    try {
      // queryContractSmart helper often expects { contract, chain, data }
      const res = await queryContractSmart({ contract, chain: 'terra', data: msgObj });
      if (res && Object.keys(res).length > 0) {
        log('queryContractSmart OK', contract, msgObj);
        return res;
      }
      // fall through to LCD if empty
      log('queryContractSmart returned empty, falling back to LCD', contract);
    } catch (err) {
      log('queryContractSmart failed — fallback to LCD', contract, err?.message ?? err);
    }
  }
  // fallback to direct LCD smart query
  return await lcdSmartQuery(contract, msgObj);
}

/**
 * bankBalances via LCD (native balances)
 */
async function bankBalances(address) {
  const url = `${LCD}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
  try {
    const res = await get(url);
    const payload = res?.data ?? res?.result ?? res;
    const balances = payload?.balances ?? payload?.result?.balances ?? payload?.balances ?? [];
    return Array.isArray(balances) ? balances : [];
  } catch (err) {
    log('bankBalances ERROR', address, err?.message ?? err);
    return [];
  }
}

/**
 * Read cw20 balance -> BigInt
 * Tries queryContractSmart first (via unified smartQuery)
 */
async function cw20Balance(tokenAddr, owner) {
  try {
    const r = await smartQuery(tokenAddr, { balance: { address: owner } });
    let raw = '0';
    if (!r) raw = '0';
    else if (typeof r === 'string') raw = r;
    else if (typeof r.balance === 'string' || typeof r.balance === 'number') raw = String(r.balance);
    else if (r.balance && typeof r.balance === 'object' && (r.balance.amount || r.balance[0])) raw = String(r.balance.amount ?? r.balance[0] ?? '0');
    else if (r.data && (r.data.balance || r.data.amount)) raw = String(r.data.balance ?? r.data.amount);
    else {
      const found = Object.values(r).find(v => typeof v === 'string' && /^\d+$/.test(v));
      raw = found ?? '0';
    }
    raw = raw.replace(/[^0-9]/g, '') || '0';
    return BigInt(raw);
  } catch (err) {
    log('cw20Balance ERROR', tokenAddr, owner, err?.message ?? err);
    return 0n;
  }
}

/* -------------------------
   Concurrency limiter (small p-limit)
   ------------------------- */
const pLimit = (concurrency) => {
  let active = 0;
  const queue = [];
  const next = () => {
    if (!queue.length) return;
    if (active >= concurrency) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn()
      .then((v) => resolve(v))
      .catch((e) => reject(e))
      .finally(() => { active--; next(); });
  };
  return (fn) => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    next();
  });
};
const limit = pLimit(Number(process.env.CONCURRENCY || 6));

/* -------------------------
   Metadata caching + fetch
   ------------------------- */
const metadataCache = {};
async function fetchTokenMetadata(tokenAddress) {
  if (!tokenAddress) return null;
  if (metadataCache[tokenAddress]) {
    log('metadata cache hit', tokenAddress);
    return metadataCache[tokenAddress];
  }
  log('fetchTokenMetadata start', tokenAddress);

  // 1) Try token_info via unified smartQuery (prefers queryContractSmart)
  try {
    const data = await smartQuery(tokenAddress, { token_info: {} });
    if (data && Object.keys(data).length) {
      if (data.decimals !== undefined) data.decimals = Number(data.decimals);
      metadataCache[tokenAddress] = data;
      log('metadata via token_info OK', tokenAddress, data);
      return data;
    }
  } catch (e) {
    log('token_info smartQuery failed', tokenAddress, e?.message ?? e);
  }

  // 2) Try direct LCD token_info (redundant but defensive)
  try {
    const url = `${LCD}/cosmwasm/wasm/v1/contract/${tokenAddress}/smart/${b64({ token_info: {} })}`;
    const res = await get(url);
    const payload = res?.data ?? res?.result ?? res;
    if (payload && Object.keys(payload).length) {
      if (payload.decimals !== undefined) payload.decimals = Number(payload.decimals);
      metadataCache[tokenAddress] = payload;
      log('metadata via direct LCD OK', tokenAddress, payload);
      return payload;
    }
  } catch (e) {
    log('direct LCD token_info failed', tokenAddress, e?.message ?? e);
  }

  // 3) From abi.json config
  for (const tokenInfo of Object.values(tokens)) {
    if (tokenInfo.address === tokenAddress) {
      const md = { name: tokenInfo.name || 'Unknown', symbol: tokenInfo.symbol || 'UNKNOWN', decimals: Number(tokenInfo.decimals ?? 6) };
      metadataCache[tokenAddress] = md;
      log('metadata from abi.json', tokenAddress, md);
      return md;
    }
  }

  // 4) default fallback
  const fallback = { name: 'Unknown', symbol: 'UNKNOWN', decimals: 6 };
  metadataCache[tokenAddress] = fallback;
  log('metadata fallback used', tokenAddress, fallback);
  return fallback;
}

/* -------------------------
   Balance helpers
   ------------------------- */
function nativeBalance(balancesArray, denom) {
  if (!Array.isArray(balancesArray)) return 0n;
  const row = balancesArray.find(r => r?.denom === denom);
  if (!row) return 0n;
  const amt = String(row.amount ?? '0').replace(/[^0-9]/g, '') || '0';
  return BigInt(amt);
}

/* -------------------------
   Core: fetchBalances(module, api)
   ------------------------- */
async function fetchBalances(moduleName, api) {
  const contractList = Array.isArray(contracts[moduleName]) ? contracts[moduleName].filter(a => a && a.trim()) : [];
  if (!contractList.length) {
    log('no contracts for module', moduleName);
    return;
  }

  // prefetch metadata for cw20 tokens (cached)
  const cw20s = Object.values(tokens).filter(t => t.type === 'cw20').map(t => t.address);
  await Promise.all(cw20s.map(addr => fetchTokenMetadata(addr)));

  // process each owner contract in parallel (limited)
  await Promise.all(contractList.map(owner => limit(async () => {
    log('processing owner', owner, 'module', moduleName);

    // fetch bank balances once for native tokens
    let bank = [];
    try { bank = await bankBalances(owner); } catch (e) { log('bankBalances failed', owner, e?.message ?? e); bank = []; }

    // iterate tokens
    await Promise.all(Object.entries(tokens).map(([tk, tokenInfo]) => limit(async () => {
      try {
        if (tokenInfo.type === 'cw20') {
          const md = await fetchTokenMetadata(tokenInfo.address);
          const bal = await cw20Balance(tokenInfo.address, owner); // BigInt
          if (bal > 0n) {
            // ALWAYS pass string to api.add to avoid JS precision loss
            api.add(tokenInfo.address, bal.toString());
            log('api.add cw20', tokenInfo.address, owner, bal.toString(), 'decimals', md?.decimals);
            // optional: price via coingecko id (human amount)
            // if (tokenInfo.coingeckoId) {
            //   const human = BigIntToHumanString(bal, md?.decimals ?? tokenInfo.decimals ?? 6);
            //   api.add(`coingecko:${tokenInfo.coingeckoId}`, human);
            // }
          }
        } else if (tokenInfo.type === 'native') {
          const bal = nativeBalance(bank, tokenInfo.address);
          if (bal > 0n) {
            api.add(tokenInfo.address, bal.toString());
            log('api.add native', tokenInfo.address, owner, bal.toString(), 'decimals', tokenInfo.decimals);
          }
        }
      } catch (e) {
        log('token loop error', tokenInfo?.address ?? tk, owner, e?.message ?? e);
      }
    })));
  })));
}

/* -------------------------
   BigInt -> human helper (optional)
   ------------------------- */
function BigIntToHumanString(bigintAmount, decimals = 6) {
  const s = bigintAmount.toString().padStart(decimals + 1, '0');
  const intPart = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, '') || '0';
  return `${intPart}.${frac}`;
}

/* -------------------------
   Exports: build terraExport dynamically
   ------------------------- */
const terraExport = {};
Object.keys(contracts).forEach(moduleKey => {
  const arr = contracts[moduleKey] || [];
  if (Array.isArray(arr) && arr.some(a => a && a.trim())) {
    terraExport[moduleKey] = async (api) => {
      await fetchBalances(moduleKey, api);
    };
  }
});

// aggregate tvl
if (Object.keys(terraExport).length > 0) {
  terraExport.tvl = async (api) => {
    for (const key of Object.keys(terraExport)) {
      if (key === 'tvl') continue;
      log('running module for tvl', key);
      await terraExport[key](api);
    }
  };
} else {
  terraExport.tvl = async () => {};
}

module.exports = {
  methodology: `${protocol?.description || 'Protocol'}. TVL fetched from on-chain LCD and contract queries. Dynamic contract list is in abi.json.`,
  timetravel: false,
  terra: terraExport,
};
