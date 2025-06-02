const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// V3 Juicebox Terminals
const Terminal_V3 = "0x594Cb208b5BB48db1bcbC9354d1694998864ec63";
const Terminal_V3_1 = "0xFA391De95Fcbcd3157268B91d8c7af083E607A5C";
const Terminal_V3_1_1 = "0x457cD63bee88ac01f3cD4a67D5DCc921D8C0D573";
const Terminal_V3_1_2 = "0x1d9619E10086FdC1065B114298384aAe3F680CC0";
// Tokens
const ETH = ADDRESSES.null

module.exports = {
    methodology: "Count the value of the Ether in the Juicebox V3 terminals",
  ethereum:
  {
    start: '2022-09-20', // 2022-10-20 15:04:35(UTC)
    tvl: async (_, block) => sumTokens2({
      block,
      tokensAndOwners: [
        [ETH, Terminal_V3],
        [ETH, Terminal_V3_1],
        [ETH, Terminal_V3_1_1],
        [ETH, Terminal_V3_1_2],
      ]
    })
  }
};
