const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { getChainTvl } = require('../helper/getUniSubgraphTvl')
const {staking} = require('../helper/staking')

const subgraphs = {
    'ethereum': 'sushiswap/exchange',
    'xdai': 'sushiswap/xdai-exchange',
    'polygon': 'sushiswap/matic-exchange',
    'fantom': 'sushiswap/fantom-exchange',
    'bsc': 'sushiswap/bsc-exchange',
    //'harmony': 'https://sushi.graph.t.hmny.io/subgraphs/name/sushiswap/harmony-exchange',
    //'okexchain': 'https://q.hg.network/subgraphs/name/sushiswap/okex-exchange',
    'avax': 'sushiswap/avalanche-exchange',
    'celo': 'sushiswap/celo-exchange',
    'arbitrum': 'sushiswap/arbitrum-exchange',
    //'okexchain': 'https://q.hg.network/subgraphs/name/okex-exchange/oec',
    'heco': 'https://q.hg.network/subgraphs/name/heco-exchange/heco',
}

const chainTvl = getChainTvl(
    Object.fromEntries(Object.entries(subgraphs).map(s => [s[0], s[1].startsWith("http")?s[1]:"https://api.thegraph.com/subgraphs/name/" + s[1]])),
    "factories",
    "liquidityUSD"
)

const subgraphChainTvls = Object.keys(subgraphs).reduce((obj, chain) => ({
    ...obj,
    [chain]: {
        tvl:chainTvl(chain)
    }
}), {})

const xSUSHI = "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"
const SUSHI = ADDRESSES.ethereum.SUSHI

subgraphChainTvls.ethereum.staking = staking(xSUSHI, SUSHI);

module.exports=subgraphChainTvls;