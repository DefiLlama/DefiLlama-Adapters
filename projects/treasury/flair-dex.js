const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const FLDXTreasury = "0xAD276dA5aAad4181B991fd93Bc7dCCFb46811003";
const FLDX = "0x107D2b7C619202D994a4d044c762Dd6F8e0c5326"

module.exports = treasuryExports({
  avax: {
    tokens: [ 
        nullAddress,
        ADDRESSES.avax.USDt,//USDT
        ADDRESSES.avax.USDT_e,//USDT.e
        ADDRESSES.avax.WAVAX,//AVAX
        ADDRESSES.avax.USDC,//USDC
        ADDRESSES.avax.USDC_e,//USDC.e
        ADDRESSES.polygon.BUSD,//BUSD
        "0x1C1CDF8928824dac36d84B3486D598B9799bA6c0",//aBASED
        "0x107D2b7C619202D994a4d044c762Dd6F8e0c5326",//FLDX
     ],
    owners: [FLDXTreasury],
    ownTokens: [FLDX],
  },
})