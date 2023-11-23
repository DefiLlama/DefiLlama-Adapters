const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const SUSHI = ADDRESSES.ethereum.SUSHI;
const xSUSHI = "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
     ],
    owners: [
      "0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3",
      "0xf73B31c07e3f8Ea8f7c59Ac58ED1F878708c8A76"
    ],
    ownTokens: [
      SUSHI,
      xSUSHI
    ],
  },
})
