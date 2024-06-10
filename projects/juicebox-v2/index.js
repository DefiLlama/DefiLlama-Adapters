const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// V2 Juicebox Terminals
const Terminal_V2 = "0x7Ae63FBa045Fec7CaE1a75cF7Aa14183483b8397";
// Tokens
const ETH = ADDRESSES.null

module.exports = {
    methodology: "Count the value of the Ether in the Juicebox V2 terminal",
  ethereum:
  {
    start: 1653853643, // 2022-05-29 19:47:23 (UTC)
    tvl: async (_, block) => sumTokens2({
      block,
      tokensAndOwners: [
        [ETH, Terminal_V2],
      ]
    })
  }
};
