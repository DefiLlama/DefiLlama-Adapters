const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xc8899da25423ac52aa711b97ae04c8888fa1e1d7";
const treasury2 = "0xd84701828745c98405a3e1153fccea627963859a"
const OM = "0x3593d125a4f7849a1b059e64f4517a86dd60c95d";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        '0xFe2e637202056d30016725477c5da089Ab0A043A',//sETH2
        ADDRESSES.ethereum.DAI,//DAI
        ADDRESSES.ethereum.RETH,//rETH
        ADDRESSES.ethereum.STETH,//stETH
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.WBTC,//WBTC
        '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',//ALCX
        '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D'//renBTC
     ],
    owners: [treasury, treasury2],
    ownTokens: [OM],
  },
})