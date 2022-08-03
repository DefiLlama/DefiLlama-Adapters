const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const { gql } = require("graphql-request")
const { blockQuery } = require('../helper/graph')

const { transformPolygonAddress, transformEthereumAddress, transformArbitrumAddress, transformOptimismAddress } = require('../helper/portedTokens');

const transformFactories = {
    "ethereum": transformEthereumAddress,
    "optimism": transformOptimismAddress,
    "arbitrum": transformArbitrumAddress,
    "polygon": transformPolygonAddress
}

const compoundorSugraphUrls = {
    "ethereum": "https://api.thegraph.com/subgraphs/name/revert-finance/compoundor-mainnet",
    "optimism": "https://api.thegraph.com/subgraphs/name/revert-finance/compoundor-optimism",
    "arbitrum": "https://api.thegraph.com/subgraphs/name/revert-finance/compoundor-arbitrum",
    "polygon": "https://api.thegraph.com/subgraphs/name/revert-finance/compoundor-polygon"
};

const v3SubgraphUrls = {
    "ethereum": "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    "optimism": "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
    "arbitrum": "https://api.thegraph.com/subgraphs/name/revert-finance/uniswap-v3-arbitrum", // needs custom subgraph url because the one from ianlapham is missing position entity
    "polygon": "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon"
};

function tvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {

        const balances = {}

        const block = chainBlocks[chain]

        const compoundorQuery = gql`query get_tokens($block: Int) { tokens(block: { number: $block }, where: { account_not: null }) { id } }`;
        const tokens = (await blockQuery(compoundorSugraphUrls[chain], compoundorQuery, block, 1000))["tokens"];

        const tokenIds = tokens.map(t => t.id)
        const tokenIdsString = `[${tokenIds.join(",")}]`

        const positionsQuery = gql`
            query positions($block: Int) {
                    positions (block: { number: $block },
                        where: {id_in: ${tokenIdsString}}
                    ) {
                            tickLower ${chain !== "arbitrum" ? "{tickIdx}" : ""}
                            tickUpper ${chain !== "arbitrum" ? "{tickIdx}" : ""}
                            liquidity
                            pool {
                                sqrtPrice
                                token0 { id }
                                token1 { id }
                            }
                    }
            }`
            
        const positionsResult = (await blockQuery(v3SubgraphUrls[chain], positionsQuery, block, 1000))
        const positions = positionsResult["positions"];

        const transform = await transformFactories[chain]()

        positions.forEach(p => {
            addUniv3PositionBalances(p, transform, balances)
        })

        return balances
    }
}

// uniswap v3 tick/liquidity calculations
const tickBase = 1.0001
function tick_to_price(tick) {
    return tickBase ** tick
}

function calculate_x(L, sp, sa, sb) {
    sp = Math.max(Math.min(sp, sb), sa)
    return L * (sb - sp) / (sp * sb)
}

function calculate_y(L, sp, sa, sb) {
    sp = Math.max(Math.min(sp, sb), sa)
    return L * (sp - sa)
}

function addUniv3PositionBalances(position, transform, balances) {

    // Extract pool parameters
    const pool = position['pool']
    const sqrtPrice = pool['sqrtPrice']
    const token0 = pool['token0']['id']
    const token1 = pool['token1']['id']
    const bottom_tick = position['tickLower']['tickIdx'] || position['tickLower']
    const top_tick = position['tickUpper']['tickIdx'] || position['tickUpper']
    const liquidity = position['liquidity']

    // Compute square roots of prices corresponding to the bottom and top ticks
    const sa = tick_to_price(bottom_tick) ** 0.5
    const sb = tick_to_price(top_tick) ** 0.5
    const sp = sqrtPrice / (2 ** 96)

    // Compute real amounts of the two assets
    const amount0 = calculate_x(liquidity, sp, sa, sb)
    const amount1 = calculate_y(liquidity, sp, sa, sb)

    sdk.util.sumSingleBalance(balances, transform(token0), BigNumber(amount0).toFixed(0))
    sdk.util.sumSingleBalance(balances, transform(token1), BigNumber(amount1).toFixed(0))
}

module.exports = {
    methodology: "TVL of Revert Compoundor as sum of values of all staked UniswapV3 NFTs",
    doublecounted: false,
    timetravel: true,
    ethereum: {
        tvl: tvl("ethereum")
    },
    polygon: {
        tvl: tvl("polygon")
    },
    optimism: {
        tvl: tvl("optimism")
    },
    arbitrum: {
        tvl: tvl("arbitrum")
    }
}