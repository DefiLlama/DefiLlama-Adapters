const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.WBTC, // WBTC
        ADDRESSES.arbitrum.USDC, //  USDC
        ADDRESSES.arbitrum.WETH, //  WETH
        ADDRESSES.arbitrum.USDT, //  USDT
        ADDRESSES.optimism.DAI, //  DAI
        '0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60', //  LDO
        ADDRESSES.arbitrum.LINK, //  LINK
        '0x82e3a8f066a6989666b031d916c43672085b1582', //  YEARN
     ],
    owners: ['0xa079c6b032133b95cf8b3d273d27eeb6b110a469'],
    ownTokens: ['0x51fc0f6660482ea73330e414efd7808811a57fa2'],
    resolveUniV3: true,
  },
})