const abi = require('./abi.json');
const { queryContract, queryV1Beta1 } = require('../helper/chain/cosmos');

const { contracts, tokens } = abi;

// Build helpers from abi.json
const TOKENS = Object.values(tokens || {});
const TOKEN_BY_ADDR = Object.fromEntries(TOKENS.map(t => [t.address, t]));
const OWNED_CW20_SET = new Set(
  TOKENS
    .filter(t => t.type === 'cw20' && (t.owner === true || t.owner === 'true'))
    .map(t => t.address)
);
const NATIVE_DENOMS = new Set(
  TOKENS.filter(t => t.type === 'native').map(t => t.address)
);

async function smartQuery(contract, msgObj) {
  const res = await queryContract({ contract, chain: 'terra', data: msgObj });
  return res?.data ?? res ?? {};
}

async function bankBalances(address) {
  const res = await queryV1Beta1({
    chain: 'terra',
    // Standard Cosmos SDK REST path
    url: `/bank/v1beta1/balances/${address}`,
  });
  return res?.balances ?? [];
}

async function cw20Balance(token, owner) {
  const r = await smartQuery(token, { balance: { address: owner } });
  const raw = String(r.balance ?? r.amount ?? '0').replace(/[^0-9]/g, '') || '0';
  return raw;
}

function nativeBalance(balances, denom) {
  const row = balances.find(r => r.denom === denom);
  return String(row?.amount ?? '0').replace(/[^0-9]/g, '') || '0';
}

// Core worker: optional exclusion for protocol-owned CW20s, with verbose logging
async function fetchBalances(moduleName, api, { excludeOwnedCw20 = false, logTag = '' } = {}) {
  const owners = (contracts[moduleName] || []).filter(Boolean);
  if (!owners.length) {
    console.log(`[${logTag || moduleName}] no owners configured`);
    return;
  }

  await Promise.all(owners.map(async owner => {
    console.log(`[${logTag || moduleName}] owner=${owner} — scanning balances`);

    const bank = await bankBalances(owner);

    // Natives
    for (const denom of NATIVE_DENOMS) {
      const bal = nativeBalance(bank, denom);
      if (+bal > 0) {
        console.log(`[${logTag || moduleName}] owner=${owner} native ${denom}=${bal}`);
        api.add(denom, bal);
      }
    }

    // CW20s
    for (const t of TOKENS) {
      if (t.type !== 'cw20') continue;
      const bal = await cw20Balance(t.address, owner);
      if (+bal <= 0) continue;

      const info = TOKEN_BY_ADDR[t.address] || {};
      const sym = info.symbol || '';
      const isOwned = OWNED_CW20_SET.has(t.address);
      const excluded = excludeOwnedCw20 && isOwned;

      console.log(
        `[${logTag || moduleName}] owner=${owner} cw20 ${sym}(${t.address})=${bal}${excluded ? ' [EXCLUDED]' : ''}`
      );

      if (!excluded) api.add(t.address, bal);
    }

    console.log(`[${logTag || moduleName}] owner=${owner} — done`);
  }));
}

// Build category fns from abi.json (default: no exclusions)
const terraExport = {};
Object.keys(contracts).forEach(key => {
  if (contracts[key]?.length) {
    terraExport[key] = (api) => fetchBalances(key, api, { excludeOwnedCw20: false, logTag: key });
  }
});

// TVL: include all desired categories but exclude owner CW20s (e.g., JURIS) everywhere
terraExport.tvl = async (api) => {
  const cats = Object.keys(contracts).filter(k => k !== 'tvl');
  await Promise.all(cats.map((k) => fetchBalances(k, api, { excludeOwnedCw20: true, logTag: `TVL:${k}` })));
};
 
module.exports = {
  methodology:
    'TVL sums native denoms and non-owned CW20s across configured contract owners; any CW20 with owner=true in abi.json (e.g., JURIS) is excluded from TVL but still logged for visibility.',
  timetravel: false,
  terra: terraExport,
};
