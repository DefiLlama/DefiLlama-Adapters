const { request, gql } = require("graphql-request");
const { getBlock } = require('../helper/getBlock')
const { sumTokens2 } = require('../helper/unwrapLPs')

const graphEndpoints = {
  'ethereum': "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2",
  "bsc": "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-bsc",
  // "heco": "https://q.hg.network/subgraphs/name/dodoex/heco",
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
          {
            lastId
          }
        );
        allPairs = allPairs.concat(response.pairs)
        lastId = response.pairs[response.pairs.length - 1].id
      } while (response.pairs.length >= 1000);

      const tokensAndOwners = []
      allPairs.forEach(pair => {
        if (pair.id.includes('-'))
          return null
        tokensAndOwners.push([pair.quoteToken.id, pair.id])
        tokensAndOwners.push([pair.baseToken.id, pair.id])
      })

      const blacklist = [
        '0xd79d32a4722129a4d9b90d52d44bf5e91bed430c',
        '0xdb1e780db819333ea79c9744cc66c89fbf326ce8', // this token is destroyed
        '0xa88c5693c9c2549a75acd2b44f052f6a5568e918', // this token is destroyed
        '0x738076a6cb6c30d906bcb2e9ba0e0d9a58b3292e', // SRSB is absuredly priced 
        '0x95e7c70b58790a1cbd377bc403cd7e9be7e0afb1', // YSL is absuredly priced 
        '0x2b1e9ded77ff8ecd81f71ffc5751622e6f1291c3', // error querying balance
      ]

      return sumTokens2({ tokensAndOwners, chain, block, blacklistedTokens: blacklist })
    }
  }
})
