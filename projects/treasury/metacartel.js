const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x4570b4fAF71E23942B8B9F934b47ccEdF7540162";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//weth
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//usdc
        '0x6243d8CEA23066d098a15582d81a598b4e8391F4',//flx
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//dai
        '0xfb5453340C03db5aDe474b27E68B6a9c6b2823Eb',//robot
        '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',//rai
     ],
    owners: [treasury]
  },
})