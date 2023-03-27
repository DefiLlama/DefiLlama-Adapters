const { nullAddress, treasuryExports } = require("../helper/treasury");

const oneInchTreasury = "0x7951c7ef839e26F63DA87a42C9a87986507f1c07";
const ONE_INCH = "0x111111111117dC0aa78b770fA6A738034120C302";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',//WBTC
     ],
    owners: [oneInchTreasury],
    ownTokens: [ONE_INCH]
  },
})