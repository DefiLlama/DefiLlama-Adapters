const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury
const treasury = "0x7b065Fcb0760dF0CEA8CFd144e08554F3CeA73D1";
const GEAR = "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D";


module.exports = treasuryExports({
  ethereum: {
    tokens: [
      // Ethereum Assets
      nullAddress,
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0x6b175474e89094c44da98b954eedeac495271d0f',
      "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",//wsteth
    ],
    owners: [treasury],
    ownTokens: [GEAR]
  },
})
