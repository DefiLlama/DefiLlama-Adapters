const { sumTokens2 } = require('../helper/unwrapLPs')
const { uniV3Export } = require('../helper/uniswapV3')

const STABLE_MAINNET_UNISWAP_V3_FACTORY = '0xC837ab0f8919Fb47f17b7cD302d88895032e5908'
const STABLE_MAINNET_POOL_FACTORY_V2 = '0x701F02d3133E14a9dfd94C399586aC22A05bCa25'

// Both Openlaunch's own permissionless pool creation (PoolFactoryV3, the
// general "create a pool" flow) and every token launch's automatic
// single-sided locked position (LaunchFactory -> the real
// NonfungiblePositionManager -> the real UniswapV3Factory directly, bypassing
// PoolFactoryV3 entirely) ultimately create pools through this same real,
// unmodified UniswapV3Factory -- so pointing uniV3Export at it alone captures
// every V3 pool's locked value regardless of which path created it or who
// holds the position (a plain LP or a launch's permanent-lock vault), since
// in Uniswap v3 the underlying tokens sit in the pool contract itself, not
// with whoever holds the position NFT.
const v3 = uniV3Export({
  stable: {
    factory: STABLE_MAINNET_UNISWAP_V3_FACTORY,
    fromBlock: 34196085,
  },
})

// Openlaunch's own V2 factory (PoolFactoryV2) is functionally a Uniswap v2
// fork but with a non-standard enumeration interface (a parameterless
// getAllPools() returning the whole pool array at once, not the classic
// allPairsLength()/allPairs(uint256) indexed-getter pair this repo's
// standard getUniTVL helper expects) -- summed manually here instead, using
// the same sumTokens2 primitive uniV3Export itself relies on.
async function v2Tvl(api) {
  const pools = await api.call({
    abi: 'function getAllPools() view returns (address[])',
    target: STABLE_MAINNET_POOL_FACTORY_V2,
  })
  if (!pools.length) return
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const ownerTokens = pools.map((pool, i) => [[token0s[i], token1s[i]], pool])
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  methodology: "Sums token balances held by every pool under Openlaunch's real UniswapV3Factory on Stable "
    + '(covers both permissionlessly-created pools and every token launch\'s permanently-locked single-sided '
    + 'position, since in Uniswap v3 the underlying tokens live in the pool contract itself) plus every pair '
    + "held by Openlaunch's own V2 factory.",
  stable: {
    tvl: async (api) => {
      await v3.stable.tvl(api)
      await v2Tvl(api)
    },
  },
}
