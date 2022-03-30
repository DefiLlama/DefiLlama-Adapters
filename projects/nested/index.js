const sdk = require('@defillama/sdk')
const { request, gql } = require("graphql-request")
const { getBlock } = require('../helper/getBlock')
const { default: BigNumber } = require('bignumber.js')
const abi = require('./abi.json')
const {chainExports} = require('../helper/exports')


const nestRecords_contract = '0x3Ee96E771D5E56b34245b023E8B31ffDf36dFafd'
const nestReserve_contract = '0x150fb0Cfa5bF3D4023bA198C725b6DCBc1577f21'
// https://thegraph.com/hosted-service/subgraph/aelin-xyz/optimism

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks, false)
    const balances = {}
    const transformAddress = (addr) => `${chain}:${addr}`

    let record_idx = 1
    const max_calls = 100
    const recordsTokens = []
    while (record_idx < max_calls) { // Could batch calls by bundles of 10 or 50 for example
      const {output: nestedRecords_i} = await sdk.api.abi.call({
          abi: abi['nestedRecords_getAssetTokens'],
          target: nestRecords_contract,
          params: record_idx,
          chain,
          block,
      })
      record_idx++
      if (false && ((!nestedRecords_i) || nestedRecords_i.length == 0))
      {
        record_idx = max_calls // Stop criteria, no more records info
      } else {
        recordsTokens.push(nestedRecords_i)
      }
    }
    const reserveTokens = [...new Set(recordsTokens.flat())]
    console.log('All tokens from every nested records', reserveTokens)
    
    const tokenBalances = await sdk.api.abi.multiCall({
      calls: reserveTokens.map(t => ({
        target: t,
        params: nestReserve_contract,
      })),
      abi: 'erc20:balanceOf',
      chain,
      block,
    });
    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transformAddress);
    
    return balances
  }
}
// console.log('yo')
// module.exports = chainExports(chainTvl, ['polygon'])
// console.log(module.exports)
// module.exports.tvl = () => ({})
// module.exports.methodology = 'Nested TVL consists of tokens held by NestedReserve, for which we can get the address using the nestedRecords contract',

module.exports = {
  // polygon: {tvl: chainTvl('polygon')}, 
  bsc: {tvl: chainTvl('bsc')}, 
  avax: {tvl: chainTvl('avax')}, 
}