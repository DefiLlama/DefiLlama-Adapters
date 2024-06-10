const {gql} = require('graphql-request')
const { blockQuery } = require('../helper/http')
const {toUSDTBalances} = require('../helper/balances');
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

async function ethereum(timestamp, block) {
    return sumTokens2({ block, owner: '0x220a9f0DD581cbc58fcFb907De0454cBF3777f76', tokens: [nullAddress]})
}

async function getTVL(subgraphName, api) {
    const endpoint = `https://api.thegraph.com/subgraphs/name/mcdexio/${subgraphName}`

    const query = gql`
        query getTvl ($block: Int) {
            factories (
                block: { number: $block }
              ){
                id
                totalValueLockedUSD
            }
        }
    `;
    const results = await blockQuery(endpoint, query, { api, blockCatchupLimit: 600, })
    return results.factories[0].totalValueLockedUSD;
}

async function arbitrum(api) {
    return toUSDTBalances(await getTVL("mcdex3-arb-perpetual", api))
}

async function bsc(api) {
    return toUSDTBalances(await getTVL("mcdex3-bsc-perpetual", api))
}

module.exports = {
    misrepresentedTokens: true,
    methodology: `Includes all locked liquidity in AMM pools, pulling the data from the mcdex subgraph`,
    arbitrum: {
        tvl: arbitrum
    },
    bsc: {
        tvl: bsc
    },
    ethereum: {
        tvl: ethereum
    },
}
