const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// V3 Juicebox Terminals
const Terminal_V3 = "0x594Cb208b5BB48db1bcbC9354d1694998864ec63";
const Terminal_V3_1 = "0xFA391De95Fcbcd3157268B91d8c7af083E607A5C";
// Tokens
const ETH = ADDRESSES.null

module.exports = {
  timetravel: true,
  methodology: "Count the value of the Ether in the Juicebox V3 terminals",
  ethereum:
  {
    start: 1663679075, // 2022-10-20 15:04:35(UTC)
    tvl: async (_, block) => sumTokens2({
      block,
      tokensAndOwners: [
        [ETH, Terminal_V3],
        [ETH, Terminal_V3_1],
      ]
    })
  }
};
