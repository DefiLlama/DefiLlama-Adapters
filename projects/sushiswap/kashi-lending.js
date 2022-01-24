const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request"); 
const {sumTokens} = require('../helper/unwrapLPs')
const { BigNumber } = require('bignumber.js');

// https://thegraph.com/hosted-service/subgraph/sushiswap/bentobox
const graphUrls = {
  'ethereum': 'https://api.thegraph.com/subgraphs/name/sushiswap/bentobox',
  'polygon': 'https://api.thegraph.com/subgraphs/name/sushiswap/matic-bentobox',
  'fantom': 'https://api.thegraph.com/subgraphs/name/sushiswap/fantom-bentobox',
  'bsc': 'https://api.thegraph.com/subgraphs/name/sushiswap/bsc-bentobox',
  'xdai': 'https://api.thegraph.com/subgraphs/name/sushiswap/xdai-bentobox',
  'arbitrum': 'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-bentobox'
}

const bentoboxQuery = gql`
query get_bentoboxes($block: Int, $tokensSkip: Int) {
   bentoBoxes(
     first: 100, 
      # block: { number: $block } 
    ) {
     id
     tokens (
         skip: $tokensSkip
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

function kashiLending(chain, borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    // Retrieve bento boxes tokens held in contract
    const boxTokens = []
    const graphUrl = graphUrls[chain]
    const block = chainBlocks[chain]
    const transform = x => `${chain}:${x}`

    // Query graphql endpoint and add tokenAndOwner to list
    const { bentoBoxes } = await request(
      graphUrl, 
      bentoboxQuery, 
      {block, tokensSkip: 0}
    )
    bentoBoxes.forEach(async box => {
      boxTokens.push(...box.tokens.map(t => [t.id, box.id]))
      if (box.totalTokens > box.tokens.length) {
        throw (`More tokens (${box.totalTokens}) in bento box than returned by graphql api, probably over the 1000 tokens limit`)
      }
    })

    // Sum all tokens
    const balances = {}
    // Filtering out causing null issues on bsc
    const filteredOutTokens = ['0x87b008e57f640d94ee44fd893f0323af933f9195']
    const filtered = boxTokens.filter(t => (filteredOutTokens.indexOf(t[0]) == -1))
    await sumTokens(balances, filtered, block, chain, transform)

    // What is retrieved before this line and stored as balances is what's left in the bentobox, so real TVL. 
    // Now compute borrowed = supply minus tvl where supply is retrieved from thegraph
    if (borrowed) {
      const borrowed_balances = {}
      bentoBoxes.forEach(box => {
        box.tokens.forEach(async token =>
          await sdk.util.sumSingleBalance(borrowed_balances, transform(token.id), token.totalSupplyBase) 
        )
      })
      for (const [key, value] of Object.entries(balances)) {
        borrowed_balances[key] = BigNumber.max(0, BigNumber(borrowed_balances[key]).minus(balances[key]));
      }
      return borrowed_balances
    } else {
      return balances
    }
  }
}

module.exports = {
  tvl: kashiLending,
  kashiLending: kashiLending,
  methodology: `TVL of Sushiswap Kashi lending consists of the tokens held in Sushiswap Bentoboxes contracts - one bentobox per chain - and borrows = supply - tvl`
}
