// projects/pumpspace/index.js
const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const CHAIN = 'avax'

// --- FACTORIES / CONTRACTS ---
const PUMP_FACTORY   = '0x26B42c208D8a9d8737A2E5c9C57F4481484d4616' // V2
const PUMP_V3        = '0xE749c1cA2EA4f930d1283ad780AdE28625037CeD' // V3/Trident

// If you later expose staking for other MasterChefs, add here
const MASTERCHEFS = [
  '0x40a58fc672F7878F068bD8ED234a47458Ec33879', // SHELL
  '0x56b54a1384d35C63cD95b39eDe9339fEf7df3E42', // KRILL
  '0x06C551B19239fE6a425b3c45Eb8b49d28e8283C6', // PEARL
]

// --- TOKENS (project/local wrappers + protocol tokens) ---
const TOKENS = {
  SHELL: '0xaD4CB79293322c07973ee83Aed5DF66A53214dc6',
}

// ---------- V2 factory TVL (sum token reserves held by each pair) ----------
const uniAbis = {
  allPairsLength: 'function allPairsLength() view returns (uint256)',
  allPairs:       'function allPairs(uint256) view returns (address)',
  token0:         'function token0() view returns (address)',
  token1:         'function token1() view returns (address)',
}

// ---------- V3 (Trident) TVL: factory → pool list → asset list → sum with transforms ----------
const tridentAbis = {
  totalPoolsCount: "uint256:totalPoolsCount",
  getPoolAddress: "function getPoolAddress(uint256 idx) view returns (address pool)",
  getAssets: "address[]:getAssets",
}


async function v2FactoryTVL(api) {
  const n = await api.call({ target: PUMP_FACTORY, abi: uniAbis.allPairsLength })
  const idx = Array.from({ length: Number(n) }, (_, i) => i)
  const pairs = await api.multiCall({
    abi: uniAbis.allPairs,
    calls: idx.map(i => ({ target: PUMP_FACTORY, params: i })),
  })

  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: uniAbis.token0, calls: pairs.map(p => ({ target: p })) }),
    api.multiCall({ abi: uniAbis.token1, calls: pairs.map(p => ({ target: p })) }),
  ])

  const tokensAndOwners = []
  for (let i = 0; i < pairs.length; i++) {
    const t0 = token0s[i]?.toLowerCase()
    const t1 = token1s[i]?.toLowerCase()
    if (!t0 || !t1) continue
    tokensAndOwners.push([t0, pairs[i]])
    tokensAndOwners.push([t1, pairs[i]])
  }

  return sumTokens2({
    api,
    tokensAndOwners,
  })
}

async function v3FactoryTVL(ts, _block, { [CHAIN]: block }) {
  const pairLength = (await sdk.api.abi.call({
    target: PUMP_V3, abi: tridentAbis.totalPoolsCount, chain: CHAIN, block
  })).output

  const idxs = Array.from({ length: Number(pairLength) }, (_, i) => i)
  const pools = (await sdk.api.abi.multiCall({
    abi: tridentAbis.getPoolAddress, chain: CHAIN,
    calls: idxs.map(i => ({ target: PUMP_V3, params: [i] })), block
  })).output.map(r => r.output)

  const { output: assetLists } = await sdk.api.abi.multiCall({
    abi: tridentAbis.getAssets, chain: CHAIN,
    calls: pools.map(p => ({ target: p })), block,
  })

  const tokensAndOwners = []
  assetLists.forEach(({ output, input: { target: pool } }) =>
    output.forEach(token => tokensAndOwners.push([token, pool]))
  )

  return sumTokens2({ 
    chain: CHAIN, 
    block, 
    tokensAndOwners, 
  })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `
  TVL is computed by summing reserves across PumpSpace V2 and V3 (Trident) factories on Avalanche.
  Single-asset staking (if enabled) reflects tokens deposited in the respective MasterChef contracts.
  `,
    avax: {
    tvl: sdk.util.sumChainTvls([
      v2FactoryTVL, 
      v3FactoryTVL,
    ]),
    staking: sdk.util.sumChainTvls([
      // If you later add KRILL/PEARL single-asset staking, append similar lines here.
      staking([MASTERCHEFS[0]], [TOKENS.SHELL]),
    ])
  },
}
