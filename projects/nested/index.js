const sdk = require('@defillama/sdk')
const { getBlock } = require('../helper/getBlock')
const { request, gql } = require("graphql-request")
const {chainExports} = require('../helper/exports')
const abi = require('./abi.json')


const nestRecords_contract = '0x3Ee96E771D5E56b34245b023E8B31ffDf36dFafd'
const nestReserve_contract = '0x150fb0Cfa5bF3D4023bA198C725b6DCBc1577f21'


const graphUrl = 'https://api.nested.finance/graphql'
const graphQuery = gql`
query GET_NESTED_NFTS ($chainId: Chain, $offset: Int, $limit: Int) {
  nfts (filter: {
      order: replications,
      isReplicate: false,
      minUsdValue: 5,
      limit: $limit,
      offset: $offset, 
      chain: $chainId
  }) {
    id
    chain
    name
    owner
    replicationCount
    creationDate
    holdings {
        token {
          id
          symbol
      }
    }
  }
}
`

function chainTvl_graphql(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks, false)
    const balances = {}
    const transformAddress = (addr) => `${chain}:${addr}`
    
    const limit = 15
    const chainId = chain == 'polygon'? 'poly' : chain // avax and bsc as-is
    const allNestedNFTs = [];
    let offset = 0;
    while ((offset !== -1) && offset <= 100) {
      console.log('yo')
      const { nfts: nestedNFTs_i } = await request(
      // const nfts = await request(
        graphUrl,
        graphQuery, 
        {chainId, offset, limit}
      );
      console.log(offset, 'nfts', nestedNFTs_i.length, nestedNFTs_i)
      offset += limit
      if (nestedNFTs_i && nestedNFTs_i.length > 0) {
        allNestedNFTs.push(...nestedNFTs_i);
        // Could add another check on nestedNFTs_i.length to be == limit otherwise stop condition 
      } else {
        offset = -1;
      }
    }
    console.log('allNestedNFTs', allNestedNFTs)
    let recordsTokens = allNestedNFTs.map(nft => nft.holdings.map(
      t => t.token.id
    )).flat()
    console.log('recordsTokens', recordsTokens)
    recordsTokens = recordsTokens.map(t => t.substring(t.indexOf(':') + 1))
    console.log('recordsTokens', recordsTokens)
    const reserveTokens = [...new Set(recordsTokens)]
    console.log('reserveTokens', reserveTokens)

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

const max_calls = 100
function chainTvl_onchain(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks, false)
    const balances = {}
    const transformAddress = (addr) => `${chain}:${addr}`

    let record_idx = 1
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
    console.log(`${chain}: All tokens from every nested records`, reserveTokens)
    
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

// module.exports = chainExports(chainTvl_graphql, ['polygon', 'bsc', 'avax'])
module.exports = chainExports(chainTvl_onchain, ['bsc'])
module.exports.methodology = 'Nested TVL consists of tokens held by NestedReserve, for which we can get the address using the nestedRecords contract'
