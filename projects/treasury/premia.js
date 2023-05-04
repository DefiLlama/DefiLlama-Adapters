const {  nullAddress,treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', // WBTC
        '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', //  USDC
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', //  WETH
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', //  USDT
        '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', //  DAI
        '0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60', //  LDO
        '0xf97f4df75117a78c1a5a0dbb814af92458539fb4', //  LINK
        '0x82e3a8f066a6989666b031d916c43672085b1582', //  YEARN
     ],
    owners: ['0xa079c6b032133b95cf8b3d273d27eeb6b110a469'],
    ownTokens: ['0x51fc0f6660482ea73330e414efd7808811a57fa2'],
    resolveUniV3: true,
  },
})