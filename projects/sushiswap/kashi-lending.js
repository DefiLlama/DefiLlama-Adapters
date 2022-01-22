const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request"); 
const {sumTokens} = require('../helper/unwrapLPs')

const graphUrl = 'https://api.thegraph.com/subgraphs/name/sushiswap/bentobox' // https://thegraph.com/hosted-service/subgraph/sushiswap/bentobox
const bentoboxQuery = gql`
query get_bentoboxes {
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

async function kashiLendingFantom(timestamp, ethBlock, chainBlocks) {
  const chain = "fantom"
  const block = chainBlocks[chain]
  const box = "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966"
  const boxTokens = [
    "0x82f0b8b456c1a451378467398982d4834b6829c1", // mim
    "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", //wftm
    "0xbe41772587872a92184873d55b09c6bb6f59f895", // mars
    "0x8866414733f22295b7563f9c5299715d2d76caf4", //curve dai-usdc
    "0xd4f94d0aaa640bbb72b5eec2d85f6d114d81a88e", //g3crv
    "0x425ccc1390bed338d98daff91ff0f03738b534ef", //fake mim
    "0xf710d90a1bd702daea619eebbe876e7085c2a1df", //moo g3crv
    "0x2126be94443334fd71428dba3c638fb722d1838e", // spa
    "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0", //yvWFTM
    "0x89346b51a54263cf2e92da79b1863759efa68692", //wsSPA
  ]
  const balances = {}
  await sumTokens(balances, boxTokens.map(t=>[t, box]), block, chain, addr=>`${chain}:${addr}`)
  return balances
}


async function kashiLending(timestamp, block, chainBlocks) {
  // Retrieve bento boxes tokens held in contract
  const { bentoBoxes } = await request(
    graphUrl, 
    bentoboxQuery, 
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
  tvl: kashiLendingFantom,
  kashiLendingFantom,
  kashiLending: kashiLending,
  methodology: `TVL of Sushiswap Kashi lending consists of the tokens held in Sushiswap Bentoboxes contracts (only one bentobox at the moment)`
}
