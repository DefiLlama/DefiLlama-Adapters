const { request, gql } = require("graphql-request");
const { getBlock } = require('../helper/http')
const sdk = require('@defillama/sdk')

const graphEndpoints = {
  'ethereum': "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2",
  "bsc": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-bsc",
  // "heco": "https://q.hg.network/subgraphs/name/dodoex/heco",
  "polygon": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-polygon",
  "arbitrum": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-arbitrum",
  "aurora": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-aurora"
}
const graphQuery = gql`
query get_pairs($lastId: String, $block: Int) {
    pairs(
      first: 1000,
      block: { number: $block }
      where: {id_gt: $lastId}
    ) {
        id
        baseReserve
        quoteReserve
        baseToken{
          id
          symbol
          usdPrice
          decimals
        }
        quoteToken{
          id
          symbol
          usdPrice
          decimals
        }
    }
}
`

module.exports = {};

Object.keys(graphEndpoints).forEach(chain => {
  module.exports[chain] = {
    tvl: async (ts, _, chainBlocks) => {

      const block = await getBlock(ts, chain, chainBlocks)
      let allPairs = []
      let lastId = ""
      let response;
      do {
        response = await request(
          graphEndpoints[chain],
          graphQuery,
          { lastId, block: block - 500, }
        );
        allPairs = allPairs.concat(response.pairs)
        lastId = response.pairs[response.pairs.length - 1].id
      } while (response.pairs.length >= 1000);

      const balances = {}
      const blacklist = [
        '0xd79d32a4722129a4d9b90d52d44bf5e91bed430c',
        '0xdb1e780db819333ea79c9744cc66c89fbf326ce8', // this token is destroyed
        '0xa88c5693c9c2549a75acd2b44f052f6a5568e918', // this token is destroyed
        '0x738076a6cb6c30d906bcb2e9ba0e0d9a58b3292e', // SRSB is absuredly priced 
        '0x95e7c70b58790a1cbd377bc403cd7e9be7e0afb1', // YSL is absuredly priced 
        '0x2b1e9ded77ff8ecd81f71ffc5751622e6f1291c3', // error querying balance
        '0x272c2CF847A49215A3A1D4bFf8760E503A06f880', // abnb LP mispriced
        '0xd4ca5c2aff1eefb0bea9e9eab16f88db2990c183', // XRPC
      ].map(i => i.toLowerCase())

      allPairs.forEach(pair => {
        if (pair.id.includes('-'))
          return null
        if (!blacklist.includes(pair.baseToken.id.toLowerCase()) && +pair.baseReserve > 1)
          sdk.util.sumSingleBalance(balances, chain + ':' + pair.baseToken.id, pair.baseReserve * (10 ** pair.baseToken.decimals))
        if (!blacklist.includes(pair.quoteToken.id.toLowerCase()) && +pair.quoteReserve > 1)
          sdk.util.sumSingleBalance(balances, chain + ':' + pair.quoteToken.id, pair.quoteReserve * (10 ** pair.quoteToken.decimals))
      })

      return balances
    }
  }
})
