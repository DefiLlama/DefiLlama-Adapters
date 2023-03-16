const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x0BC3807Ec262cB779b38D65b38158acC3bfedE10";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC
        "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",//stETH
     ],
    owners: [treasury,],
  },
})