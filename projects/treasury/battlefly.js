const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.USDC, //  USDC
        ADDRESSES.arbitrum.WETH, //  WETH
        ADDRESSES.arbitrum.USDT, //  USDT
        ADDRESSES.optimism.DAI, //  DAI
     ],
    owners: ['0xF5411006eEfD66c213d2fd2033a1d340458B7226'],
    ownTokens: ['0x872bAD41CFc8BA731f811fEa8B2d0b9fd6369585', '0x539bde0d7dbd336b79148aa742883198bbf60342'],
  },
})