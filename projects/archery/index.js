const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')

const V2_FACTORY = '0x0769d7d58e064d3dd4c2bb17274506f4824a9657'
const V3_FACTORY = '0xc481038c013fe96f38ce7a2dc417b2b1b78b16a4'

const v2Tvl = getUniTVL({
  factory: V2_FACTORY,
  useDefaultCoreAssets: true,
  hasStablePools: true,
  abis: {
    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  },
})

const v3Tvl = uniV3Export({
  arc: {
    factory: V3_FACTORY,
    fromBlock: 22447744,
    eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, int24 indexed tickSpacing, address pool)',
    topics: ['0xab0d57f0df537bb25e80245ef7748fa62353808c54d6e528a9dd20887aed9ac2'],
  },
}).arc.tvl

async function tvl(api) {
  const v2Balances = await v2Tvl(api)
  const v3Balances = await v3Tvl(api)
  const balances = {}

  for (const [token, amount] of Object.entries(v2Balances ?? {})) {
    sdk.util.sumSingleBalance(balances, token, amount)
  }
  for (const [token, amount] of Object.entries(v3Balances ?? {})) {
    sdk.util.sumSingleBalance(balances, token, amount)
  }

  return balances
}

module.exports = {
  methodology: 'TVL is the value of the on-chain reserves in Archery V2 pools plus the ERC-20 balances held by Archery concentrated-liquidity pools on Arc. Pools are discovered from Archery factories. Gauge balances are not counted separately because the underlying assets remain in the pool contracts, avoiding double-counting.',
  start: 1790217438,
  arc: { tvl },
}

