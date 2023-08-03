const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const sushiSwapTreasury = "0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3";
const SUSHI = ADDRESSES.ethereum.SUSHI;


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
     ],
    owners: [sushiSwapTreasury],
    ownTokens: [SUSHI],
  },
})
