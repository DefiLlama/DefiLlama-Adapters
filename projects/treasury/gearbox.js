const { nullAddress, treasuryExports } = require("../helper/treasury");
const { tokensBare: tokens } = require("../helper/tokenMapping");

// Treasury
const treasury = "0x7b065Fcb0760dF0CEA8CFd144e08554F3CeA73D1";
const GEAR = "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        // Ethereum Assets
        nullAddress,
        tokens.weth,
        tokens.wbtc,
        tokens.usdc,
        tokens.dai,
        "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",//wsteth
     ],
    owners: [treasury],
    ownTokens: [GEAR]
  },
})
