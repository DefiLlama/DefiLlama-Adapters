const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')



const graphEndpoint = 'https://graph-node.yodaplus.net:8000/subgraphs/name/pro100skm/factory'
const currentQuery = gql`
    query uniswapFactories {
        uniswapFactories(first: 1) {
            totalLiquidityUSD
        }
    }
`
const historicalQuery = gql`
    query uniswapDayDatas {
        uniswapDayDatas(
            first: 1000
            orderBy: date
            orderDirection: asc
        ) {
            date
            dailyVolumeUSD
            totalLiquidityUSD
            __typename
        }
    }
`

const graphUrl = 'https://graph-node.yodaplus.net:8000/subgraphs/name/pro100skm/factory'
const graphQuery = gql`
    query get_tvl($block: Int) {
        uniswapFactories(
            block: { number: $block }
        ) {
            totalVolumeUSD
            totalLiquidityUSD
        }
    }
`;
async function tvl(timestamp, ethBlock, chainBlocks) {
    if (Math.abs(timestamp - Date.now() / 1000) < 3600) {
        const tvl = await request(graphEndpoint, currentQuery, {}, {
            "referer": "https://app.xspswap.finance/",
            "origin": "https://app.xspswap.finance/",
        })
        return toUSDTBalances(tvl.uniswapFactories[0].totalLiquidityUSD)
    } else {
        const tvl = (await request(graphEndpoint, historicalQuery)).uniswapDayDatas
        let closest = tvl[0]
        tvl.forEach(dayTvl => {
            if (Math.abs(dayTvl.date - timestamp) < Math.abs(closest.date - timestamp)) {
                closest = dayTvl
            }
        })
        if(Math.abs(closest.date - timestamp) > 3600*24){ // Oldest data is too recent
            const {uniswapFactories} = await request(
                graphUrl,
                graphQuery,
                {
                    block: chainBlocks['xdc'],
                }
            );
            const usdTvl = Number(uniswapFactories[0].totalLiquidityUSD)

            return toUSDTBalances(usdTvl)
        }
        return toUSDTBalances(closest.totalLiquidityUSD)
    }
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://analytics.xspswap.finance/ as the source',
    xdc: {
        tvl
    },
}
