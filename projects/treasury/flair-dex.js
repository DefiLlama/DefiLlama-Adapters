const { nullAddress, treasuryExports } = require("../helper/treasury");

const FLDXTreasury = "0xAD276dA5aAad4181B991fd93Bc7dCCFb46811003";
const FLDX = "0x107D2b7C619202D994a4d044c762Dd6F8e0c5326"

module.exports = treasuryExports({
  avax: {
    tokens: [ 
        nullAddress,
        "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",//USDT
        "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",//USDT.e
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",//AVAX
        "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",//USDC
        "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",//USDC.e
        "0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39",//BUSD
        "0x1C1CDF8928824dac36d84B3486D598B9799bA6c0",//aBASED
        "0x107D2b7C619202D994a4d044c762Dd6F8e0c5326",//FLDX
     ],
    owners: [FLDXTreasury],
    ownTokens: [FLDX],
  },
})