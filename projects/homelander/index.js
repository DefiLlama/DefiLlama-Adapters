const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

/* Homelander (MEV-X) is a plugin for AMMs that expose a hook surface. When a
 * swap moves a pool away from the wider market it closes that gap inside the
 * same transaction and pays the realised arbitrage to the pool's LPs and its
 * deployer, instead of leaving it to an outside searcher.
 *
 * TVL is the liquidity of the pools the plugin runs in. The plugin never takes
 * custody of anything, so what is counted is the pools' own reserves — the
 * same liquidity the host DEX reports, which is why this is doublecounted.
 *
 * A pool gets the plugin when the DEX's Algebra factory mints one for it, and
 * the Homelander plugin factory that mints it announces the pool by address in
 * PluginCreated. So the pools are read off the protocol's own factory, one
 * small log query per deployment, and pools opened later are picked up with no
 * code change. Each factory states on chain which Homelander deployment it
 * belongs to: defaultProfitDistributor(), defaultMevxExecutor() and
 * defaultMevxRouter() are that chain's Homelander contracts. */

const PLUGIN_CREATED = 'event PluginCreated(address indexed pool, address plugin)'

const config = {
  base: [
    // Hydrex Integral (algebraFactory 0x36077D39cdC65E1e3FB65810430E5b2c4D5fA29E)
    { factory: '0xa8dD4C05796801C734E99d5582E90e3a8bD88194', fromBlock: 42314036 },
    // QuickSwap v4 (algebraFactory 0xC5396866754799B9720125B104AE01d935Ab9C7b)
    { factory: '0xC3f2BE91360D9FFc874e35b111780CCfb1A3ebCe', fromBlock: 46026550 },
  ],
  flare: [
    // SparkDEX v4 (algebraFactory 0x805488DaA81c1b9e7C5cE3f1DCeA28F21448EC6A)
    { factory: '0x9CAa8F20B7CE0bD2D97F614a473A68ba6140970d', fromBlock: 56928287 },
  ],
  polygon: [
    // QuickSwap v4 (algebraFactory 0x134c1dBE4860A9cAaf89002574fFe814772D9904)
    { factory: '0xfe2041D7779a28Fc6bF39223A952baD0BEFFD525', fromBlock: 85606804 },
  ],
  somnia: [
    // QuickSwap v4 (algebraFactory 0x0ccff3D02A3a200263eC4e0Fdb5E60a56721B8Ae)
    { factory: '0x7b4553a35d3020064cB464a8d75A4735ffdA15bD', fromBlock: 307452276 },
  ],
  soneium: [
    // QuickSwap v4 (algebraFactory 0x8Ff309F68F6Caf77a78E9C20d2Af7Ed4bE2D7093)
    { factory: '0x672bB0a1Ac120cb61eCDc6D2C3aa1e042F0EB941', fromBlock: 22852414 },
  ],
}

async function tvl(api) {
  const pools = []
  for (const { factory, fromBlock } of config[api.chain]) {
    const logs = await getLogs2({
      api, target: factory, fromBlock,
      eventAbi: PLUGIN_CREATED,
      extraKey: `homelander-${factory}`,
    })
    /* Read positionally. A fresh getLogs2 call hands back ethers Result
     * objects that also answer to log.pool, but a cached one has been through
     * JSON and comes back a bare array, where the named lookup is silently
     * undefined and every pool disappears. */
    const POOL = 0
    logs.forEach(log => pools.push(String(log[POOL])))
  }
  if (!pools.length) throw new Error('homelander: no pools found — log fetch likely failed')

  // an Algebra pool holds its own reserves, unlike a v4 singleton
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const ownerTokens = pools.map((pool, i) => [[token0s[i], token1s[i]], pool])
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  methodology: "Counts the liquidity of every pool the Homelander plugin runs in. The plugin takes no custody, so what is counted is the pools' own reserves, and the figure is doublecounted with the DEX that hosts them. Pools are read from the PluginCreated event of the Homelander plugin factory on each deployment, which announces a pool the moment a plugin is minted for it, so pools opened later by the DEX are picked up without a code change. Each factory names its Homelander contracts on chain through defaultProfitDistributor, defaultMevxExecutor and defaultMevxRouter. Reserves are the pool contracts' token balances.",
  doublecounted: true,
  start: '2026-03-05',
}

Object.keys(config).forEach(chain => { module.exports[chain] = { tvl } })
