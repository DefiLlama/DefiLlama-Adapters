const { nullAddress, treasuryExports } = require("../helper/treasury");

const Treasury = "0xb966b7038A2b42A0419457dA4F4d2FBa23097aE1";
const LSD = "0xfAC77A24E52B463bA9857d6b758ba41aE20e31FF";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',//stETH
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
     ],
    owners: [Treasury],
    ownTokens: [LSD],
  },
})