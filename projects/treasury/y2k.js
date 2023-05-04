const {  nullAddress,treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', //  USDC
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', //  WETH
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', //  USDT
        '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', //  DAI
        '0x569061e2d807881f4a33e1cbe1063bc614cb75a4', 
        '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c', 
        '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c', 
     ],
    owners: ['0x5c84cf4d91dc0acde638363ec804792bb2108258'],
    ownTokens: ['0x65c936f008bc34fe819bce9fa5afd9dc2d49977f'],
  },
})