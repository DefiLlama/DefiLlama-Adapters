const { uniTvlExports } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')
const sdk = require('@defillama/sdk')

const CHAIN = 'cronos'

const V2_ABIS = {
    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
}

const V2_FACTORY = '0xc6bd451EE56E8e42b8dde3921aD851645C416126'
const V3_FACTORY = '0x3AAAB2384e40C2F405EF87Ea7B893B406C32E59C'
const V3_FROM_BLOCK = 24286000

const v2 = uniTvlExports(
    { [CHAIN]: V2_FACTORY },
    { abis: V2_ABIS, hasStablePools: true, permitFailure: true },
)

const v3 = uniV3Export({
    [CHAIN]: { factory: V3_FACTORY, fromBlock: V3_FROM_BLOCK },
})

module.exports = {
    methodology: 'TVL = sum of reserves from Solidly (V2) pools + Concentrated Liquidity (V3) pools, fetched from their factories.',
    [CHAIN]: {
        tvl: sdk.util.sumChainTvls([v2[CHAIN].tvl, v3[CHAIN].tvl]),
    },
}

