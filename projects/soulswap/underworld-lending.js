const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request"); 
const { BigNumber } = require('bignumber.js');

// https://thegraph.com/hosted-service/subgraph/soulswapfantom/coffinbox
const graphUrls = {
  'fantom': sdk.graph.modifyEndpoint('FhS8cRWsTPZwXfmn7b8YGvKii2h2ghr2v7ah5T8oiDmo'),
  'avax': sdk.graph.modifyEndpoint('6WonmxWbw3MSVXVR5P4VhC8jWBEG5RkipWzxhAA67hoP'),
}

const coffinboxQuery = gql`
query get_coffinboxes($block: Int, $tokensSkip: Int) {
   coffinBoxes(
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

function underworldLending(chain, borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    // Retrieve coffin boxes tokens held in contract
    const boxTokens = []
    const graphUrl = graphUrls[chain]
    const block = chainBlocks[chain]
    const transform = x => `${chain}:${x}`

    // Query graphql endpoint and add tokenAndOwner to list
    const { coffinBoxes } = await request(
      graphUrl, 
      coffinboxQuery, 
      {block, tokensSkip: 0}
    )
    coffinBoxes.forEach(async box => {
      boxTokens.push(...box.tokens.map(t => [t.id, box.id]))
      if (box.totalTokens > box.tokens.length) {
        throw (`More tokens (${box.totalTokens}) in coffin box than returned by graphql api, probably over the 1000 tokens limit`)
      }
    })

    // Sum all tokens
    const balances = {}

    // What is retrieved before this line and stored as balances is what's left in the coffinbox, so real TVL. 
    // Now compute borrowed = supply minus tvl where supply is retrieved from thegraph
    if (borrowed) {
      const borrowed_balances = {}
      coffinBoxes.forEach(box => {
        box.tokens.forEach(async token =>
          sdk.util.sumSingleBalance(borrowed_balances, transform(token.id), token.totalSupplyBase) 
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
  underworldLending,
  methodology: `TVL of SoulSwap Underworld lending consists of the tokens held in SoulSwap CoffinBox contracts - one coffinbox per chain - and borrows = supply - tvl`
}
