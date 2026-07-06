const ADDRESSES = require('../helper/coreAssets.json')
const { transformDexBalances } = require('../helper/portedTokens')
const { sumTokensExport } = require('../helper/unwrapLPs')

const WMON = ADDRESSES.monad.WMON
const USDC = ADDRESSES.monad.USDC
const USDT = ADDRESSES.monad.USDT
const WETH = ADDRESSES.monad.WETH
const WBTC = ADDRESSES.monad.WBTC
const WSOL = ADDRESSES.monad.WSOL
const AUSD = ADDRESSES.monad.AUSD
const LVMON = '0x91b81bfbe3A747230F0529Aa28d8b2Bc898E6D56'

const V1_BONDING_CURVE = '0xA7283d07812a02AFB7C09B60f8896bCEA3F90aCE'
const V2_BONDING_CURVE = '0x9f3832732923252A21044F21eE6bd87F09514ae4'
const V2_FACTORY = '0xA25b13127e63ddae6d0b35570FF3D39dBD621001'

const coreAssets = [
  USDC,
  USDT,
  WETH,
  WMON,
  WBTC,
  WSOL,
  AUSD,
]

const v2QuoteTokens = [
  ...coreAssets,
  LVMON,
]

const tokensAndOwners = [
  [WMON, V1_BONDING_CURVE],
  ...v2QuoteTokens.map(token => [token, V2_BONDING_CURVE]),
]

const coreTokens = new Set([
  ...coreAssets.map(token => token.toLowerCase()),
  LVMON.toLowerCase(),
])

const bondingCurveTvl = sumTokensExport({
  tokensAndOwners,
})

async function v2DexTvl(api) {
  const pairs = await api.fetchList({
    lengthAbi: 'uint256:allPairsLength',
    itemAbi: 'function allPairs(uint256) view returns (address)',
    target: V2_FACTORY,
  })

  const [token0s, token1s, reserves] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: pairs }),
    api.multiCall({ abi: 'address:token1', calls: pairs }),
    api.multiCall({
      abi: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)',
      calls: pairs,
    }),
  ])

  const data = reserves.map((reserve, i) => ({
    token0: token0s[i],
    token1: token1s[i],
    token0Bal: reserve._reserve0,
    token1Bal: reserve._reserve1,
  }))

  return transformDexBalances({
    api,
    data,
    coreTokens,
    skipUnknownTokens: true,
  })
}

async function tvl(api) {
  await bondingCurveTvl(api)
  await v2DexTvl(api)
  return api.getBalances()
}

module.exports = {
  methodology: 'Value of quote tokens held in the Nad.fun bonding curve contracts and liquidity in Nad.fun V2 pairs',
  monad: {
    tvl,
  },
}
