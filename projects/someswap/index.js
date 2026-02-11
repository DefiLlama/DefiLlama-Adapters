const { sumTokens2 } = require('../helper/unwrapLPs');
const { fetchURL } = require('../helper/utils');

const SOME_FACTORY = '0x00008A3c1077325Bb19cd93e5a0f1E95144700fa';
const SOME_V2_POOLS_API = process.env.SOMESWAP_V2_POOLS_API || 'https://api-someswap.something.tools/api/amm/pools/v2';
const NATIVE_MON_ADDRESS = '0x0000000000000000000000000000000000000000';
const WMON = '0x3bd359c1119da7da1d913d1c4d2b7c461115433a';

async function tvl(api) {
  const [v1Pairs, v2Pools] = await Promise.all([
    getV1Pairs(api),
    getV2Pools(),
  ]);

  const v1TokensAndOwners = await buildTokensAndOwners(api, v1Pairs);
  const v1TokenOwnersDeduped = dedupeTokensAndOwners(v1TokensAndOwners);
  await sumTokens2({ api, tokensAndOwners: v1TokenOwnersDeduped, permitFailure: true });
  addV2ReservesToBalances(api, v2Pools);
  return api.getBalances();
}

async function getV1Pairs(api) {
  const pairsCount = await api.call({ target: SOME_FACTORY, abi: 'function allPairsLength() view returns (uint256)' });
  const totalPairs = Number(pairsCount);
  if (!totalPairs) return [];
  const indices = Array.from({ length: totalPairs }, (_, i) => i);
  return api.multiCall({ target: SOME_FACTORY, abi: 'function allPairs(uint256) view returns (address)', calls: indices.map((i) => ({ params: [i] })) });
}

async function getV2Pools() {
  const { data } = await fetchURL(SOME_V2_POOLS_API);
  const groups = data?.pools ?? [];
  const pools = [];
  const seenPairs = new Set();

  for (const group of groups) {
    for (const pool of group?.pools ?? []) {
      const backend = pool?.backend ?? {};
      const pairAddress = normalizeAddress(backend.pair_address ?? backend.lp_token_address);
      const token0 = normalizeAddress(backend.token0_address ?? pool?.token0?.address ?? group?.token0?.address);
      const token1 = normalizeAddress(backend.token1_address ?? pool?.token1?.address ?? group?.token1?.address);
      const reserve0 = backend.reserve0;
      const reserve1 = backend.reserve1;

      if (!isValidAddress(pairAddress)) continue;
      if (seenPairs.has(pairAddress)) continue;
      if (!isValidTokenAddress(token0) || !isValidTokenAddress(token1)) continue;
      if (!isIntegerString(reserve0) || !isIntegerString(reserve1)) continue;

      seenPairs.add(pairAddress);
      pools.push({ token0, token1, reserve0, reserve1 });
    }
  }

  return pools;
}

function isValidAddress(address) {
  return typeof address === 'string'
    && /^0x[a-fA-F0-9]{40}$/.test(address)
    && address.toLowerCase() !== NATIVE_MON_ADDRESS;
}

function isValidTokenAddress(address) {
  return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
}

function normalizeAddress(address) {
  return typeof address === 'string' ? address.toLowerCase() : '';
}

function normalizeTokenAddress(address) {
  const normalized = normalizeAddress(address);
  return normalized === NATIVE_MON_ADDRESS ? WMON : normalized;
}

async function buildTokensAndOwners(api, pairAddresses) {
  if (!pairAddresses.length) return [];
  const tokens0 = await api.multiCall({ abi: 'function token0() view returns (address)', calls: pairAddresses });
  const tokens1 = await api.multiCall({ abi: 'function token1() view returns (address)', calls: pairAddresses });
  const tokensAndOwners = [];
  for (let i = 0; i < pairAddresses.length; i++) {
    const token0 = normalizeTokenAddress(tokens0[i]);
    const token1 = normalizeTokenAddress(tokens1[i]);
    if (isValidAddress(token0)) tokensAndOwners.push([token0, pairAddresses[i]]);
    if (isValidAddress(token1)) tokensAndOwners.push([token1, pairAddresses[i]]);
  }
  return tokensAndOwners;
}

function dedupeTokensAndOwners(tokensAndOwners) {
  const seen = new Set();
  const deduped = [];
  for (const [token, owner] of tokensAndOwners) {
    const normalizedToken = normalizeAddress(token);
    const normalizedOwner = normalizeAddress(owner);
    if (!isValidAddress(normalizedToken) || !isValidAddress(normalizedOwner)) continue;
    const key = `${normalizedToken}:${normalizedOwner}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push([normalizedToken, normalizedOwner]);
  }
  return deduped;
}

function isIntegerString(value) {
  return typeof value === 'string' && /^\d+$/.test(value);
}

function addV2ReservesToBalances(api, pools) {
  for (const { token0, token1, reserve0, reserve1 } of pools) {
    addTokenBalance(api, token0, reserve0);
    addTokenBalance(api, token1, reserve1);
  }
}

function addTokenBalance(api, token, amount) {
  if (!isIntegerString(amount) || amount === '0') return;
  if (token === NATIVE_MON_ADDRESS) {
    api.addGasToken(amount);
  } else if (isValidAddress(token)) {
    api.add(token, amount);
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the sum of reserves for all v1 factory pairs (onchain balances) and all v2 pools returned by the SomeSwap API (reserve0/reserve1).',
  monad: {
    tvl
  },
};
