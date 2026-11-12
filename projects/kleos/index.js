// Kleos: a launchpad on Elysium (https://thekleos.pro). Every coin launches straight into a pool with its liquidity
// locked, so TVL is what sits in Kleos's own venues:
//  - KleosSwap, Kleos's Uniswap v3-style DEX, where classic launches trade
//  - Kleos's own Uniswap v4 PoolManager, where its v4 launches, $KLEOS-paired launches and its first v5 set trade
//  - the Road to Core funds (HYPE backers put toward listing a coin on HyperCore)
//  - the limit-order escrow (HYPE held for open buy orders)
// Kleos's current v5 coins trade on Uniswap's own v4 PoolManager on Elysium, which the Uniswap V4 adapter already counts,
// so they're left out here. $KLEOS, staked or sitting in
// Kleos's venues, is reported under staking.

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const KLEOSSWAP_FACTORY = '0x809ff79945FfFbf9B8Df33Bb3B62872CEB2efaF1'
const KLEOSSWAP_FROM_BLOCK = 7700
const KLEOS_POOL_MANAGER = '0xb308B5df891c300a5f5a5b8fdBC30108bA842490'
const CORE_FUNDS = [
  '0x6274d0eB33e16BDf9B5Ebd97C7d43B054BF1F3e2',
  '0x6aC6A8204Df95AD604eC138AEe1fE6C57D7D857B', // first launchpad's
]
const LIMIT_ESCROW = '0x10AffB1Fe0dCB8a2A6e34Cb6ccfa7cF26e116Ce4'

const KLEOS = '0x51C343Ed5131F17895991849860B61C2cb0E7e7a'
const KLEOS_STAKING = '0xdd9Ece123c8c9EE95122B412871C52987E4aBcdD'
// Kleos's own wrapped HYPE, which KleosSwap pools are quoted in (mapped to HYPE in helper/tokenMapping.js).
const KLEOS_WHYPE = '0x0269031ace34a7821e9D9980d087c35cE7c19EEF'
// Tokens Kleos's v4 pools are quoted in besides HYPE and $KLEOS: BLOB (ElysPump) and KNTQ.
const V4_QUOTES = ['0x9a9815Af521149E8D982791703A31bca2F95f534', '0xe45a355d9e9cAd2aD85F2d03E3eE3102A036acF0']

const isKleos = (token) => token.toLowerCase() === KLEOS.toLowerCase()

async function getPools(api) {
  return getLogs2({
    api,
    target: KLEOSSWAP_FACTORY,
    fromBlock: KLEOSSWAP_FROM_BLOCK,
    eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
  })
}

// Everything in Kleos's venues except $KLEOS, which goes to staking.
async function tvl(api) {
  const pools = await getPools(api)
  const ownerTokens = pools.map((p) => [[p.token0, p.token1].filter((t) => !isKleos(t)), p.pool])
  ownerTokens.push([[nullAddress, KLEOS_WHYPE, ADDRESSES.elysium.WHYPE, ...V4_QUOTES], KLEOS_POOL_MANAGER])
  ownerTokens.push([[nullAddress], CORE_FUNDS[0]], [[nullAddress], CORE_FUNDS[1]])
  ownerTokens.push([[nullAddress, KLEOS_WHYPE, ADDRESSES.elysium.WHYPE], LIMIT_ESCROW])
  return sumTokens2({ api, ownerTokens })
}

// $KLEOS in the staking contract, the v4 PoolManager and every KleosSwap pool paired with it.
async function staking(api) {
  const pools = await getPools(api)
  const kleosPools = pools.filter((p) => isKleos(p.token0) || isKleos(p.token1)).map((p) => p.pool)
  return sumTokens2({ api, owners: [KLEOS_STAKING, KLEOS_POOL_MANAGER, ...kleosPools], tokens: [KLEOS] })
}

module.exports = {
  methodology:
    "TVL is the tokens held by Kleos's own venues on Elysium: every KleosSwap pool (Kleos's Uniswap v3-style DEX), " +
    "Kleos's own Uniswap v4 PoolManager, the Road to Core funds and the limit-order escrow, excluding $KLEOS. Kleos v5 coins " +
    "that trade on Uniswap's v4 PoolManager are counted by the Uniswap V4 adapter, so they're not counted again here. " +
    "Staking is the $KLEOS held by the Kleos staking contract, the Kleos v4 PoolManager and the KleosSwap pools paired with $KLEOS.",
  start: '2026-10-25',
  elysium: {
    tvl,
    staking,
  },
}
