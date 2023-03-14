const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x0B70A2653B6E7BF44A3c80683E9bD9B90489F92A";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',//stETH
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',//WBTC
     ],
    owners: [treasury],
  },
})