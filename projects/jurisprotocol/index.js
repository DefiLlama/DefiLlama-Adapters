const BigNumber = require('bignumber.js');
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

function addToken(api, tokenAddress, amount) {
  const info = TOKEN_BY_ADDR[tokenAddress] || {};
  if (tokenAddress.startsWith('ibc/') && info.coingeckoId) {
    const decimals = info.decimals ?? 6;
    const balance = new BigNumber(amount).div(10 ** decimals).toNumber();
    api.addCGToken(info.coingeckoId, balance);
  } else {
    api.add(tokenAddress, amount);
  }
}

// Core worker: optional exclusion for protocol-owned CW20s, with verbose logging
async function fetchBalances(moduleName, api, { excludeOwnedCw20 = false, logTag = '' } = {}) {
  const owners = (contracts[moduleName] || []).filter(Boolean);
  if (!owners.length) {
    return;
  }

  await Promise.all(owners.map(async owner => {
    const bank = await bankBalances(owner);

    // Natives
    for (const denom of NATIVE_DENOMS) {
      const bal = nativeBalance(bank, denom);
      if (+bal > 0) {
        addToken(api, denom, bal);
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

      if (!excluded) addToken(api, t.address, bal);
    }
  }));
}

// Build category fns from abi.json
const terraExport = {};

// TVL categories to sum
const TVL_CATEGORIES = ['lending', 'liquidation_queues', 'liquidation_vault', 'margin', 'reserve', 'ownTokens', 'treasury'];

terraExport.tvl = async (api) => {
  await Promise.all(
    TVL_CATEGORIES.map((k) => fetchBalances(k, api, { excludeOwnedCw20: true, logTag: `TVL:${k}` }))
  );
};

// Staking (holds native LUNC or CW20s, owner CW20 JURIS is allowed here)
if (contracts.staking?.length) {
  terraExport.staking = (api) => fetchBalances('staking', api, { excludeOwnedCw20: false, logTag: 'staking' });
}

// Vesting (holds JURIS for vesting, owner CW20 JURIS is allowed here)
if (contracts.vesting?.length) {
  terraExport.vesting = (api) => fetchBalances('vesting', api, { excludeOwnedCw20: false, logTag: 'vesting' });
}

// Pool2 (in case they have it later)
if (contracts.pool2?.length) {
  terraExport.pool2 = (api) => fetchBalances('pool2', api, { excludeOwnedCw20: false, logTag: 'pool2' });
}

// Borrowed
if (abi.borrowed_pools) {
  terraExport.borrowed = async (api) => {
    await Promise.all(
      Object.entries(abi.borrowed_pools).map(async ([pool, token]) => {
        const borrowedRaw = await smartQuery(pool, { total_borrowed: {} });
        const rawVal = borrowedRaw?.total_borrowed ?? borrowedRaw?.amount ?? borrowedRaw;
        const borrowed = String(rawVal ?? '0').replace(/[^0-9]/g, '') || '0';
        if (+borrowed > 0) {
          addToken(api, token, borrowed);
        }
      })
    );
  };
}

module.exports = {
  methodology:
    'TVL sums native denoms and non-owned CW20s across configured lending pools, liquidation queues, liquidation vault, and margin account contracts. JURIS token is counted in staking and vesting but excluded from TVL.',
  timetravel: false,
  terra: terraExport,
};
