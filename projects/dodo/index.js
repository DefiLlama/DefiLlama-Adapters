const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock')

const graphEndpoints = {
    'ethereum': "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2",
    "bsc": "https://pq.hg.network/subgraphs/name/dodoex-v2-bsc/bsc",
    "heco": "https://q.hg.network/subgraphs/name/dodoex/heco",
    "polygon": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-polygon",
}
const graphQuery = gql`
query get_pairs($lastId: String) {
    pairs(
      first: 1000,
      where: {id_gt: $lastId}
    ) {
        id
        baseReserve
        quoteReserve
        baseToken{
          id
          symbol
          usdPrice
        }
        quoteToken{
          id
          symbol
          usdPrice
        }
    }
}
`

async function getChainTvl(chain, block, transformAddr) {
    let allPairs = []
    let lastId = ""
    let response;
    do {
        response = await request(
            graphEndpoints[chain],
            graphQuery,
            {
                lastId
            }
        );
        allPairs = allPairs.concat(response.pairs)
        lastId = response.pairs[response.pairs.length - 1].id
    } while (response.pairs.length >= 1000);

    const balanceCalls = allPairs.map(pair => {
        if (pair.id.includes('-')) {
            return null
        }
        return [{
            target: pair.quoteToken.id,
            params: [pair.id]
        }, {
            target: pair.baseToken.id,
            params: [pair.id]
        }]
    }).filter(pair => pair !== null).flat()

    const balanceResults = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls,
        block,
        chain
    })
    const balances = {}
    sdk.util.sumMultiBalanceOf(balances, balanceResults, true, transformAddr)

    return balances
}

function bsc(timestamp, ethBlock, chainBlocks) {
    return getChainTvl('bsc', chainBlocks['bsc'], addr => `bsc:${addr}`)
}

function eth(timestamp, ethBlock, chainBlocks) {
    return getChainTvl('ethereum', ethBlock, addr => addr)
}

function polygon(timestamp, ethBlock, chainBlocks) {
    return getChainTvl('polygon', chainBlocks['polygon'], addr => `polygon:${addr}`)
}

async function heco(timestamp, ethBlock, chainBlocks) {
    return getChainTvl('heco', await getBlock(timestamp, 'heco', chainBlocks), addr => `heco:${addr}`)
}

module.exports = {
    ethereum: {
        tvl: eth,
    },
    bsc: {
        tvl: bsc
    },
    polygon: {
        tvl: polygon
    },
    // We don't include heco because their subgraph is outdated
    tvl: sdk.util.sumChainTvls([eth, bsc, polygon])
}
