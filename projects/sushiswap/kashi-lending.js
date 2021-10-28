const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request"); 
const {sumTokens} = require('../helper/unwrapLPs')

const graphUrl = 'https://api.thegraph.com/subgraphs/name/sushiswap/bentobox' // https://thegraph.com/hosted-service/subgraph/sushiswap/bentobox
const bentoboxQuery = gql`
query get_bentoboxes($block: Int) {
   bentoBoxes(
     first: 100, 
      # block: { number: $block } 
    ) {
     id
     tokens (
         skip: 0
         first: 1000
         orderBy: totalSupplyBase
         orderDirection: desc
     ) {
       id
       symbol
       name
       decimals
       totalSupplyBase # totalSupplyElastic
     }
     totalTokens
   }
 } 
`

async function kashiLending(timestamp, block, chainBlocks) {
  // Retrieve bento boxes tokens held in contract
  const { bentoBoxes } = await request(
    graphUrl, 
    bentoboxQuery, 
    {block}
  )
  const boxTokens = []
  bentoBoxes.forEach(async box => {
    boxTokens.push(...box.tokens.map(t => [t.id, box.id]))
    if (box.totalTokens > box.tokens.length) {console.log('More tokens in bento box than returned by graphql api, probably over the 1000 tokens limit')}
  })
  const balances = {}
  await sumTokens(balances, boxTokens, block, 'ethereum')
  return balances
}

module.exports = {
  tvl: kashiLending,
  methodology: `TVL of Sushiswap Kashi lending consists of the tokens held in Sushiswap Bentoboxes contracts (only one bentobox at the moment)`
}
