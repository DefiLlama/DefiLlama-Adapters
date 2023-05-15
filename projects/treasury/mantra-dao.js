const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xc8899da25423ac52aa711b97ae04c8888fa1e1d7";
const treasury2 = "0xd84701828745c98405a3e1153fccea627963859a"
const OM = "0x3593d125a4f7849a1b059e64f4517a86dd60c95d";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0xFe2e637202056d30016725477c5da089Ab0A043A',//sETH2
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',//DAI
        '0xae78736Cd615f374D3085123A210448E74Fc6393',//rETH
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',//stETH
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',//WBTC
        '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',//ALCX
        '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D'//renBTC
     ],
    owners: [treasury, treasury2],
    ownTokens: [OM],
  },
})