const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const {transformArbitrumAddress} = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')

const graphEndpoints = {
    'ethereum': "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2",
    "bsc": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-bsc",
    "heco": "https://q.hg.network/subgraphs/name/dodoex/heco",
    "polygon": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-polygon",
    "arbitrum": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-arbitrum",
    "aurora": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-aurora"
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

    let balanceResults = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls,
        block,
        chain
    })
    const balances = {}

    balanceResults.output = balanceResults.output.filter(
        b => b.input.target != '0xd79d32a4722129a4d9b90d52d44bf5e91bed430c')
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

async function arbitrum(timestamp, ethBlock, chainBlocks) {
    const block = await getBlock(timestamp, "arbitrum", chainBlocks)
    const transform = await transformArbitrumAddress()
    return getChainTvl('arbitrum', block, transform)
}

async function aurora(timestamp, ethBlock, chainBlocks) {
    return getChainTvl('aurora', await getBlock(timestamp, 'aurora', chainBlocks), addr => `aurora:${addr}`)
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
    arbitrum:{
        tvl: arbitrum
    }
    // We don't include heco、aurora because their subgraph is outdated
}
