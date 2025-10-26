// index.js — Juris Protocol adapter (LCD-first, queryContractSmart last, no duplicate runs)
const { get } = require('../helper/http');
const abi = require('./abi.json');
const { queryContractSmart } = require('../helper/chain/cosmos'); // may be undefined in some runtimes

const LCD = process.env.TERRA_LCD || 'https://terra-classic-lcd.publicnode.com';
const { contracts, tokens, protocol } = abi;

// DEBUG toggle
const DEBUG = !!process.env.DEBUG;
const log = (...args) => { if (DEBUG) console.log('[JURIS]', ...args); };

// base64 encode for cosmwasm smart queries
function b64(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

/**
 * LCD smart query wrapper (primary)
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
 * Direct HTTP fallback (redundant but defensive)
 */
async function directHttpSmartQuery(contract, msgObj) {
  const url = `${LCD}/cosmwasm/wasm/v1/contract/${contract}/smart/${b64(msgObj)}`;
  try {
    const res = await get(url);
    const payload = res?.data ?? res?.result ?? res;
    log('directHttpSmartQuery OK', contract, msgObj);
    return payload;
  } catch (err) {
    log('directHttpSmartQuery ERROR', contract, err?.message ?? err);
    throw err;
  }
}

/**
 * Unified smartQuery: LCD-first, then direct HTTP (same endpoint defensive), then abi.json fallback, 
 * finally try queryContractSmart helper (if available) as LAST resort.
 *
 * NOTE: queryContractSmart is deliberately last.
 */
async function smartQueryWithFallbacks(contract, msgObj) {
  // 1) try LCD smart query (primary)
  try {
    const lcdRes = await lcdSmartQuery(contract, msgObj);
    if (lcdRes && Object.keys(lcdRes).length) return lcdRes;
    log('lcdSmartQuery returned empty, trying next fallback', contract);
  } catch (e) {
    log('lcdSmartQuery threw, trying next fallback', contract, e?.message ?? e);
  }

  // 2) direct HTTP (defensive)
  try {
    const direct = await directHttpSmartQuery(contract, msgObj);
    if (direct && Object.keys(direct).length) return direct;
    log('directHttpSmartQuery empty, trying next fallback', contract);
  } catch (e) {
    log('directHttpSmartQuery threw, trying next fallback', contract, e?.message ?? e);
  }

  // 3) If the msgObj is { token_info: {} } and token exists in abi.json, return that metadata
  if (msgObj && msgObj.token_info !== undefined) {
    for (const tokenInfo of Object.values(tokens)) {
      if (tokenInfo.address === contract) {
        const md = {
          name: tokenInfo.name || 'Unknown',
          symbol: tokenInfo.symbol || 'UNKNOWN',
          decimals: Number(tokenInfo.decimals ?? 6),
        };
        log('smartQuery fallback -> abi.json metadata used for', contract, md);
        return md;
      }
    }
  }

  // 4) LAST resort: try queryContractSmart helper if available
  if (typeof queryContractSmart === 'function') {
    try {
      const res = await queryContractSmart({ contract, chain: 'terra', data: msgObj });
      if (res && Object.keys(res).length) {
        log('queryContractSmart fallback OK', contract, msgObj);
        return res;
      }
      log('queryContractSmart fallback returned empty', contract);
    } catch (err) {
      log('queryContractSmart fallback error', contract, err?.message ?? err);
    }
  } else {
    log('queryContractSmart helper not available in this runtime — skipped as last fallback');
  }

  // Nothing found — return empty object
  return {};
}

/**
 * bankBalances via LCD (native tokens)
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
 * cw20Balance -> BigInt, using smartQueryWithFallbacks (LCD-first)
 */
async function cw20Balance(tokenAddr, owner) {
  try {
    const r = await smartQueryWithFallbacks(tokenAddr, { balance: { address: owner } });
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
    raw = String(raw).replace(/[^0-9]/g, '') || '0';
    return BigInt(raw);
  } catch (err) {
    log('cw20Balance final ERROR', tokenAddr, owner, err?.message ?? err);
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
    fn().then(resolve).catch(reject).finally(() => { active--; next(); });
  };
  return (fn) => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    next();
  });
};
const limit = pLimit(Number(process.env.CONCURRENCY || 6));

/* -------------------------
 Caches to prevent duplicates
------------------------- */
const metadataCache = {}; // tokenAddress -> metadata
const balanceCache = new Map(); // `${token}|${owner}` -> BigInt
const addedSet = new Set(); // `${token}|${owner}` -> boolean (so we don't api.add twice)

/* -------------------------
 fetchTokenMetadata (uses smartQueryWithFallbacks with LCD-first)
------------------------- */
async function fetchTokenMetadata(tokenAddress) {
  if (!tokenAddress) return null;
  if (metadataCache[tokenAddress]) {
    log('metadata cache hit', tokenAddress);
    return metadataCache[tokenAddress];
  }

  log('fetchTokenMetadata start', tokenAddress);

  // Try token_info via LCD-first fallback chain
  const data = await smartQueryWithFallbacks(tokenAddress, { token_info: {} });
  if (data && Object.keys(data).length) {
    if (data.decimals !== undefined) data.decimals = Number(data.decimals);
    metadataCache[tokenAddress] = data;
    log('metadata resolved', tokenAddress, data);
    return data;
  }

  // If smartQueryWithFallbacks returned empty, last fallback already attempted (queryContractSmart),
  // now try config entries (redundant but safe)
  for (const tokenInfo of Object.values(tokens)) {
    if (tokenInfo.address === tokenAddress) {
      const md = {
        name: tokenInfo.name || 'Unknown',
        symbol: tokenInfo.symbol || 'UNKNOWN',
        decimals: Number(tokenInfo.decimals ?? 6),
      };
      metadataCache[tokenAddress] = md;
      log('metadata from abi.json used', tokenAddress, md);
      return md;
    }
  }

  // final default
  const fallback = { name: 'Unknown', symbol: 'UNKNOWN', decimals: 6 };
  metadataCache[tokenAddress] = fallback;
  log('metadata fallback used', tokenAddress, fallback);
  return fallback;
}

/* -------------------------
 Helpers
------------------------- */
function nativeBalance(balancesArray, denom) {
  if (!Array.isArray(balancesArray)) return 0n;
  const row = balancesArray.find(r => r?.denom === denom);
  if (!row) return 0n;
  const amt = String(row.amount ?? '0').replace(/[^0-9]/g, '') || '0';
  return BigInt(amt);
}

function BigIntToHumanString(bigintAmount, decimals = 6) {
  const s = bigintAmount.toString().padStart(decimals + 1, '0');
  const intPart = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, '') || '0';
  return `${intPart}.${frac}`;
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

  // Prefetch metadata for all cw20 tokens once
  const cw20Addrs = Object.values(tokens).filter(t => t.type === 'cw20').map(t => t.address);
  await Promise.all(cw20Addrs.map(addr => fetchTokenMetadata(addr)));

  // For each owner contract, query balances (limited concurrency)
  await Promise.all(contractList.map(owner => limit(async () => {
    log('processing owner', owner, 'module', moduleName);

    // fetch bank balances once per owner
    let bank = [];
    try { bank = await bankBalances(owner); } catch (e) { log('bankBalances failed', owner, e?.message ?? e); bank = []; }

    // iterate tokens
    await Promise.all(Object.entries(tokens).map(([tk, tokenInfo]) => limit(async () => {
      const key = `${tokenInfo.address}|${owner}`; // unique per owner + token
      try {
        if (tokenInfo.type === 'cw20') {
          // avoid re-fetching same balance
          if (balanceCache.has(key)) {
            log('balanceCache hit', key);
            const cached = balanceCache.get(key);
            if (cached > 0n && !addedSet.has(key)) {
              api.add(tokenInfo.address, cached.toString());
              addedSet.add(key);
            }
            return;
          }

          const bal = await cw20Balance(tokenInfo.address, owner); // BigInt
          balanceCache.set(key, bal);

          if (bal > 0n && !addedSet.has(key)) {
            api.add(tokenInfo.address, bal.toString()); // pass string to avoid precision loss
            addedSet.add(key);
            log('api.add cw20', tokenInfo.address, owner, bal.toString());
            // optional: push coingecko keyed price (human amount)
            // if (tokenInfo.coingeckoId) {
            //   const md = metadataCache[tokenInfo.address] || await fetchTokenMetadata(tokenInfo.address);
            //   const human = BigIntToHumanString(bal, md?.decimals ?? tokenInfo.decimals ?? 6);
            //   api.add(`coingecko:${tokenInfo.coingeckoId}`, human);
            // }
          }
        } else if (tokenInfo.type === 'native') {
          if (balanceCache.has(key)) {
            const cached = balanceCache.get(key);
            if (cached > 0n && !addedSet.has(key)) {
              api.add(tokenInfo.address, cached.toString());
              addedSet.add(key);
            }
            return;
          }

          const bal = nativeBalance(bank, tokenInfo.address);
          balanceCache.set(key, bal);
          if (bal > 0n && !addedSet.has(key)) {
            api.add(tokenInfo.address, bal.toString());
            addedSet.add(key);
            log('api.add native', tokenInfo.address, owner, bal.toString());
          }
        }
      } catch (e) {
        log('token loop error', tokenInfo?.address ?? tk, owner, e?.message ?? e);
      }
    })));
  })));
}

/* -------------------------
 Build dynamic terraExport
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

// aggregate tvl that runs each module once
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
