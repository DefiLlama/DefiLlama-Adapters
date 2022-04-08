const utils = require('../helper/utils')
const { getApiTvl } = require('../helper/historicalApi')

function getTvlChain(chain) {
    return async (timestamp) => {
        return getApiTvl(timestamp,
            async () => {
                const data = await utils.fetchURL(`https://www.oneswap.net/res/${chain}/market/statistic/total`)
                return data.data.data.total_liquidity_value
            },
            async () => {
                const data = await utils.fetchURL(`https://www.oneswap.net/res/${chain}/market/statistic/graph/liquidity?interval=30d`)
                return data.data.data.map(d => ({
                    date: Math.round(new Date(d.timestamp).getTime() / 1000),
                    totalLiquidityUSD: d.liquidity
                }))
            }
        )
    }
}

module.exports = {
    misrepresentedTokens: true,
    ethereum: {
        tvl: getTvlChain("eth")
    },
    csc: {
        tvl: getTvlChain("cet")
    },
    tron: {
        tvl: getTvlChain("trx")
    },
    bsc: {
        tvl: getTvlChain("bnb")
    },
    methodology: `Counts the liquidity on all AMM pools. Metrics come from: 'https://www.oneswap.net/eth', 
    'https://www.oneswap.net/cet',  'https://www.oneswap.net/trx' and 'https://www.oneswap.net/bnb'`,
}