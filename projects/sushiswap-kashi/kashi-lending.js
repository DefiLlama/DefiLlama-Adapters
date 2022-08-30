const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { sumTokens, sumTokens2 } = require('../helper/unwrapLPs')
const { getChainTransform } = require('../helper/portedTokens')

const { getBlock } = require('../helper/getBlock')

const mimAddress = {
  ethereum: "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",
  bsc: "0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba",
  fantom: "0x82f0b8b456c1a451378467398982d4834b6829c1",
  arbitrum: "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a",
} // MIM uses kashi for unissued tokens, so these must be removed

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
       totalSupplyBase 
       totalSupplyElastic
     }
     kashiPairs(first:1000) {
       id
       bentoBox {
         id
       }
       asset {
         id
       }
       symbol
       collateral {
         id
       }
       totalAssetBase
       totalBorrowBase
       totalBorrowElastic
       totalCollateralShare
     }
     totalKashiPairs
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
    const transform = await getChainTransform(chain)

    // Query graphql endpoint and add tokenAndOwner to list
    const { bentoBoxes } = await request(
      graphUrl,
      bentoboxQuery,
      { block, tokensSkip: 0 }
    )

    // Sum all tokens
    const balances = {}
    // Filtering out causing null issues on bsc
    const filteredOutTokens = ['0x87b008e57f640d94ee44fd893f0323af933f9195']
    // MIM uses kashi for unissued tokens, so these must be removed
    if (mimAddress[chain]) filteredOutTokens.push(mimAddress[chain].toLowerCase())
    const tokensAndOwners = []

    bentoBoxes.forEach(async box => {
      if (box.totalTokens > box.tokens.length) {
        throw (`More tokens (${box.totalTokens}) in bento box than returned by graphql api, probably over the 1000 tokens limit`)
      }
      if (box.totalKashiPairs > box.kashiPairs.length) {
        throw (`More kashi pairs (${box.totalKashiPairs}) in bento box than returned by graphql api, probably over the 1000 limit`)
      }
      box.tokens.forEach(token => {
        if (filteredOutTokens.includes(token.id)) return;
        tokensAndOwners.push([token.id, box.id])
      })
      box.kashiPairs.forEach(pair => {
        if (filteredOutTokens.includes(pair.asset.id)) return;
        sdk.util.sumSingleBalance(balances, transform(pair.asset.id), pair.totalBorrowElastic)
      })
    })

    if (borrowed) return balances
    return sumTokens2({ tokensAndOwners, chain, block, })
  }
}

// Handle Kashi Lending on fantom differently for unwrapping correctly most important tokens like yvWFTM and wsSPA
const { handleYearnTokens } = require("../creditum/helper.js");
const { transformFantomAddress } = require("../helper/portedTokens");
async function kashiLendingFantom(timestamp, ethBlock, chainBlocks) {
  const transform = await transformFantomAddress()
  const chain = "fantom"
  const block = await getBlock(timestamp, chain, chainBlocks, false)
  const box = "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966"
  const wsSPA = "0x89346b51a54263cf2e92da79b1863759efa68692";
  const spa = "fantom:0x5602df4a94eb6c680190accfa2a475621e0ddbdc";

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
  await sumTokens(balances, boxTokens.map(t => [t, box]), block, chain, addr => `${chain}:${addr}`)
  await handleYearnTokens(
    balances,
    [
      "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0",
    ],
    box,
    block,
    chain,
    transform
  );
  delete balances["fantom:0x0dec85e74a92c52b7f708c4b10207d9560cefaf0"];
  const sSPA = (await sdk.api.abi.call({
    target: wsSPA,
    params: [balances["fantom:0x89346b51a54263cf2e92da79b1863759efa68692"]],
    abi: { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "wOHMTosOHM", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    block,
    chain: "fantom"
  })).output;
  balances[spa] = sSPA;
  delete balances["fantom:0x89346b51a54263cf2e92da79b1863759efa68692"];
  delete balances[chain + ":" + mimAddress[chain]]
  return balances
}

module.exports = {
  kashiLendingFantom,
  kashiLending,
  methodology: `TVL of Sushiswap Kashi lending consists of the tokens held in Sushiswap Bentoboxes contracts - one bentobox per chain - and borrows = supply - tvl`
}
