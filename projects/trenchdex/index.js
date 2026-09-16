const { getUniTVL } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')
const { mergeExports } = require('../helper/utils')

const V2_FACTORY = '0xA024e4574406BEf89e624c75758c700B5bED27C7'
const V3_FACTORY = '0xCAeF0a906F3323595A8faA14DF7eDee6F59220af'
const V3_FROM_BLOCK = 26817525
const INVALID_V3_POOLS = [
  // Zero-liquidity pool whose token0 is another V3 pool contract, not an ERC20.
  '0xa9d452042d4740dfce99ec54dda138d32cde742f',
]

const v2 = {
  pulse: {
    tvl: getUniTVL({
      factory: V2_FACTORY,
      useDefaultCoreAssets: true,
    }),
  },
}

const v3 = uniV3Export({
  pulse: {
    factory: V3_FACTORY,
    fromBlock: V3_FROM_BLOCK,
    blacklistedOwners: INVALID_V3_POOLS,
  },
})

module.exports = {
  methodology:
    'Counts the value of tokens locked in TrenchDex V2 constant-product pairs and V3 concentrated-liquidity pools on PulseChain. V2 pairs are enumerated from the factory and valued from their on-chain reserves. V3 pools are discovered from factory PoolCreated events and valued from the token balances held by each pool.',
  start: '2026-06-01',
  ...mergeExports(v2, v3),
}
