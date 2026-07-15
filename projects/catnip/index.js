const ADDRESSES = require('../helper/coreAssets.json')
const { transformDexBalances } = require('../helper/portedTokens')
const { stakingPriceLP } = require('../helper/staking')

const FACTORY = '0x002EC9782d70f4e79396c58964D4691cA648FB49'
const NIP = '0xb06f3BE6d2b2D04e6e9276d99b3F134F5429934b'
const CACHE = '0x5d00D31C9A464d51679A88d0F073401aA6Fc5d6B'
const CATNIP_WETH = '0xc08751E47611F035B958889557EDBBE33d4a8Bce'
const NIP_USDG_LP = '0xde3a686CAa73e6CCc6072Fb6880c82Fe106dDcB7'

const remap = (token) =>
  token.toLowerCase() === CATNIP_WETH.toLowerCase()
    ? ADDRESSES.robinhood.WETH
    : token

async function tvl(api) {
  const pairLength = await api.call({ target: FACTORY, abi: 'uint256:allPairsLength' })
  const pairIndexes = Array.from({ length: Number(pairLength) }, (_, i) => i)
  const pairs = await api.multiCall({
    target: FACTORY,
    abi: 'function allPairs(uint256) view returns (address)',
    calls: pairIndexes,
  })
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pairs })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pairs })
  const bals0 = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: pairs.map((pair, i) => ({ target: token0s[i], params: pair })),
  })
  const bals1 = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: pairs.map((pair, i) => ({ target: token1s[i], params: pair })),
  })

  const data = pairs.map((_, i) => ({
    token0: remap(token0s[i]),
    token1: remap(token1s[i]),
    token0Bal: bals0[i],
    token1Bal: bals1[i],
  }))

  return transformDexBalances({ api, data })
}

module.exports = {
  methodology:
    'Counts tokens locked in Alley Uniswap-V2-style liquidity pools. Catnip WETH balances are mapped 1:1 to Robinhood Chain WETH for pricing. Staking counts NIP deposited in the Cache (xNIP) vault, priced via the NIP/USDG pool.',
  start: 1784035294,
  robinhood: {
    tvl,
    staking: stakingPriceLP(CACHE, NIP, NIP_USDG_LP),
  },
}
