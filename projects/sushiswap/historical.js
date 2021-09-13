const sdk = require('@defillama/sdk')
const { getChainTvl } = require('../helper/getUniSubgraphTvl')

const subgraphs = {
    'ethereum': 'sushiswap/exchange',
    'xdai': 'sushiswap/xdai-exchange',
    'polygon': 'sushiswap/matic-exchange',
    'fantom': 'sushiswap/fantom-exchange',
    'bsc': 'sushiswap/bsc-exchange',
    'harmony': 'sushiswap/harmony-exchange',
    'okexchain': 'sushiswap/okex-exchange',
    'avax': 'sushiswap/avalanche-exchange',
    'celo': 'sushiswap/celo-exchange',
    'arbitrum': 'sushiswap/arbitrum-exchange',
    //'okexchain': 'okex-exchange/oec',
    'heco': 'heco-exchange/heco',
}

const chainTvl = getChainTvl(
    Object.fromEntries(Object.entries(subgraphs).map(s => [s[0], "https://api.thegraph.com/subgraphs/name/" + s[1]])),
    "factories",
    "liquidityUSD"
)

const subgraphChainTvls = Object.keys(subgraphs).reduce((obj, chain) => ({
    ...obj,
    [chain === 'avax' ? 'avalanche' : chain]: {
        tvl:chainTvl(chain)
    }
}), {})

module.exports={
    ...subgraphChainTvls,
    tvl: sdk.util.sumChainTvls(Object.values(subgraphChainTvls).map(tvl=>tvl.tvl))
}