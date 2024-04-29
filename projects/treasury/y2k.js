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
        '0x569061e2d807881f4a33e1cbe1063bc614cb75a4', 
        '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c', 
        '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c', 
     ],
    owners: ['0x5c84cf4d91dc0acde638363ec804792bb2108258'],
    ownTokens: ['0x65c936f008bc34fe819bce9fa5afd9dc2d49977f'],
  },
})