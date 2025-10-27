// projects/pumpspace/index.js
const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens');
const { getTridentTVL } = require('../helper/sushi-trident')
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
  bUSDT: '0x3C594084dC7AB1864AC69DFd01AB77E8f65B83B7',  // mapped to USDt
  WAVAX_PROXY: "0xAB4fBa02a2905a03adA8BD3d493FB289Dcf84024",  // mapped to canonical WAVAX below
  sBWPM: "0x6c960648d5F16f9e12895C28655cc6Dd73B660f7",
  sADOL: "0x6214D13725d458890a8EF39ECB2578BdfCd82170",
  CLAM:  "0x1ea53822f9B2a860A7d20C6D2560Fd07db7CFF85",
  PEARL: "0x08c4b51e6Ca9Eb89C255F0a5ab8aFD721420e447",
  KRILL: "0x4ED0A710a825B9FcD59384335836b18C75A34270",
  SHELL: '0xaD4CB79293322c07973ee83Aed5DF66A53214dc6',
}


// Map wrapped/local tokens to canonical core assets for pricing/aggregation.
// - bUSDT → USDt (Tether on Avalanche)
// - WAVAX proxy (0xAB4f...) → canonical WAVAX (0xB31f...) 
function transformAddress(addr) {
  const a = addr.toLowerCase()
  if (a === TOKENS.bUSDT.toLowerCase())
    return `avax:${ADDRESSES.avax.USDt.toLowerCase()}`
  // if (a === TOKENS.WAVAX_PROXY.toLowerCase())
  //   return `avax:${ADDRESSES.avax.WAVAX.toLowerCase()}`
  return `avax:${a}`
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


async function v2FactoryTVLWithBusdtMapping(api) {
  // 1) enumerate all pairs from the V2 factory
  const n = await api.call({ target: PUMP_FACTORY, abi: uniAbis.allPairsLength })
  const idx = Array.from({ length: Number(n) }, (_, i) => i)
  const pairs = await api.multiCall({
    abi: uniAbis.allPairs,
    calls: idx.map(i => ({ target: PUMP_FACTORY, params: i })),
  })

  // 2) get token0/token1 for each pair
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: uniAbis.token0, calls: pairs.map(p => ({ target: p })) }),
    api.multiCall({ abi: uniAbis.token1, calls: pairs.map(p => ({ target: p })) }),
  ])

  // 3) for each pair, count reserves via ERC20.balanceOf(pair)
  const tokensAndOwners = []
  for (let i = 0; i < pairs.length; i++) {
    const t0 = token0s[i]?.toLowerCase()
    const t1 = token1s[i]?.toLowerCase()
    if (!t0 || !t1) continue
    tokensAndOwners.push([t0, pairs[i]])
    tokensAndOwners.push([t1, pairs[i]])
  }

  // 4) aggregate with transforms (bUSDT→USDt, WAVAX proxy→WAVAX)
  return sumTokens2({
    api,
    tokensAndOwners,
    transformAddress,
    // resolveLP: false  // V2 pairs counted by reserves; no unwrapping required here
  })
}

async function v3FactoryTVLWithMappings(ts, _block, { [CHAIN]: block }) {
  // 1) number of pools
  const pairLength = (await sdk.api.abi.call({
    target: PUMP_V3, abi: tridentAbis.totalPoolsCount, chain: CHAIN, block
  })).output

  // 2) pool addresses
  const idxs = Array.from({ length: Number(pairLength) }, (_, i) => i)
  const pools = (await sdk.api.abi.multiCall({
    abi: tridentAbis.getPoolAddress, chain: CHAIN,
    calls: idxs.map(i => ({ target: PUMP_V3, params: [i] })), block
  })).output.map(r => r.output)

  // 3) assets per pool
  const { output: assetLists } = await sdk.api.abi.multiCall({
    abi: tridentAbis.getAssets, chain: CHAIN,
    calls: pools.map(p => ({ target: p })), block,
  })

  // 4) build [token, owner(pool)] tuples
  const toa = []
  assetLists.forEach(({ output, input: { target: pool } }) =>
    output.forEach(token => toa.push([token, pool]))
  )

  // 5) aggregate with transforms (bUSDT→USDt, WAVAX proxy→WAVAX)
  return sumTokens2({ chain: CHAIN, block, tokensAndOwners: toa, transformAddress })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `
  TVL is calculated by summing up all reserves from both PumpSpace V2 and V3 (Trident) factories.  
  For accurate valuation, the following transformations are applied:
  - bUSDT is mapped 1:1 to USDt (Tether) so its liquidity and price are aggregated under USDT.
  - WAVAX proxy token (0xAB4f...) is mapped to the canonical Avalanche WAVAX (0xB31f...).
  This ensures all liquidity pools using wrapped variants are properly reflected in total TVL.  
  Staking represents single-token staking of SHELL from the Shell MasterChef contract.
  `,
    avax: {
    tvl: sdk.util.sumChainTvls([
      v2FactoryTVLWithBusdtMapping, 
      v3FactoryTVLWithMappings,
    ]),
    staking: sdk.util.sumChainTvls([
      // If you later add KRILL/PEARL single-asset staking, append similar lines here.
      staking([MASTERCHEFS[0]], [TOKENS.SHELL]),
    ])
  },
}
