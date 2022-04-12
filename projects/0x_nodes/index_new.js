const sdk = require('@defillama/sdk')
const { getBlock } = require('../helper/getBlock')
const { chainExports } = require('../helper/exports')
const utils = require('../helper/utils')
const retry = require('async-retry')
const { getChainTransform } = require("../helper/portedTokens")
const { GraphQLClient, gql } = require('graphql-request')
const CONFIG = {
  ethereum: {
    uri: 'https://api.thegraph.com/subgraphs/name/0xnodes/system11',
    token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  bsc: {
    uri: 'https://api.thegraph.com/subgraphs/name/0xnodes/system11-bsc',
    token: '0x418D75f65a02b3D53B2418FB8E1fe493759c7605',
  },
  polygon: {
    uri: 'https://api.thegraph.com/subgraphs/name/0xnodes/system11-polygon',
    token: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
  },
  fantom: {
    uri: 'https://api.thegraph.com/subgraphs/name/0xnodes/system11-fantom',
    token: '0x4e15361fd6b4bb609fa63c81a2be19d873717870'
  },
  avax: {
    uri: 'https://api.thegraph.com/subgraphs/name/0xnodes/system11-avalanche',
    token: '0x85f138bfEE4ef8e540890CFb48F620571d67Eda3',
  },
  andromeda: {
    uri: 'https://andromeda-graph.metis.io/subgraphs/name/0xnodes/System11-metis/graphql',
    token: '0x9E32b13ce7f2E80A01932B42553652E053D6ed8e',
  },
}
function chainTvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const { [chain]:{ uri }} = CONFIG
        var endpoint =uri;
        var graphQLClient = new GraphQLClient(endpoint)
        let block = await getBlock(timestamp, chain, chainBlocks)
        console.log(chain+": blockheight= "+block)
        if (chain == 'bsc'){
          block = block-1000
          console.log('new bsc blockheight: '+block)
        }
        var query = gql`{strategyTokenBalances(block: {number: `+block+`})
        {amount}
        }`
        const results = await retry(async bail => await graphQLClient.request(query))
        amount = 0
        for (i = 0; i < results.strategyTokenBalances.length; i++) {  //loop through the array
          amount += Number(results.strategyTokenBalances[i].amount); //Do the math!
        }
        const balances = {}
        const { [chain]:{ token }} = CONFIG
        sdk.util.sumSingleBalance(balances, token, amount)
        console.log(balances)
        return balances
    }
}
module.exports = chainExports(chainTvl, ['ethereum', 'polygon', 'fantom', 'bsc', 'avax'])
