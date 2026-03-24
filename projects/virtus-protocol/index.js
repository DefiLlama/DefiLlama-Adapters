const sdk = require('@defillama/sdk')
const { uniV3Export } = require('../helper/uniswapV3')
const { getUniTVL } = require('../helper/unknownTokens')

const v2Abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: 'function allPools(uint256) view returns (address)',
}

const clTvl = uniV3Export({
  base: {
    factory: '0x0e5Ab24beBdA7e5Bb3961f7E9b3532a83aE86B48',
    fromBlock: 42960000,
    eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, int24 indexed tickSpacing, address pool)',
    topics: ['0xab0d57f0df537bb25e80245ef7748fa62353808c54d6e528a9dd20887aed9ac2'],
  },
})

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: sdk.util.sumChainTvls([
      clTvl.base.tvl,
      getUniTVL({ factory: '0x7F03ae4452192b0E280fB0d4f9c225DDa88C7623', useDefaultCoreAssets: true, hasStablePools: true, abis: v2Abis }),
    ]),
  },
}
