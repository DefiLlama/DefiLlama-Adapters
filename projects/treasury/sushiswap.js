const { nullAddress, treasuryExports } = require("../helper/treasury");

const sushiSwapTreasury = "0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3";
const SUSHI = "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
     ],
    owners: [sushiSwapTreasury],
    ownTokens: [SUSHI],
  },
})
