const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const { nullAddress } = require('../helper/tokenMapping')

// GlueHook (https://gluehook.trade) — a free, keyless, general-purpose Uniswap V4 hook:
// per-pool buyback pot (pump on buys, sell absorption), burn cascade, self-compounding LP.
// Not upgradeable, no owner/admin keys, 0% protocol fee.
// Deployed via CREATE from a nonce-0 deployer — SAME address on every chain.
const HOOK = '0xb216070c3509047ea597E2E626A29cea427a60C8'

// hook deployment block per chain
const config = {
  ethereum: 25703029,
  base: 49657824,
  unichain: 55356883,
  arbitrum: 492046075,
  optimism: 155253116,
  bsc: 114546905,
  polygon: 91600016,
  wc: 33384712,
  zora: 49705618,
  soneium: 26485168,
  megaeth: 23308084,
  robinhood: 30206983,
  tempo: 33657201,
  avax: 92242906,
  blast: 38647660,
  celo: 74204388,
  monad: 93918120,
  xlayer: 67336132,
}

// emitted once when a pool's pot is initialized: carries the pool's token pair
const eventAbi = 'event PotInitialized(bytes32 indexed poolId, address main, address secondary, address recipient)'

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, target: HOOK, eventAbi, fromBlock: config[chain] })
      const tokens = [nullAddress]
      logs.forEach((log) => tokens.push(log.main, log.secondary))
      return sumTokens2({ api, owner: HOOK, tokens, permitFailure: true })
    },
  }
})

module.exports.methodology =
  'TVL is every token held by the GlueHook contract itself: the per-pool buyback pots, parked donations, pending fee splits, and permanently-held (unburnable) tokens. Pool token pairs are enumerated from PotInitialized events. The hook-owned LP positions live inside the Uniswap V4 PoolManager and are counted by the uniswap-v4 adapter, not here.'
// hook-held balances are also picked up by the uniswap-v4 adapter (it credits each hook
// with its balances in the pool's tokens), same as other hook protocols e.g. bunni-v2
module.exports.doublecounted = true
