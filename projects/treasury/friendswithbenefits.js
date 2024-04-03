const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x33e626727B9Ecf64E09f600A1E0f5adDe266a0DF";
const ownTokenTreasury = "0x660F6D6c9BCD08b86B50e8e53B537F2B40f243Bd"
const FWB = "0x35bD01FC9d6D5D81CA9E055Db88Dc49aa2c699A8";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//usdc
        ADDRESSES.ethereum.WETH,//weth
        '0xBcca60bB61934080951369a648Fb03DF4F96263C',//ausdc
        '0x9355372396e3F6daF13359B7b607a3374cc638e0',//whale
     ],
    owners: [treasury, ownTokenTreasury],
    ownTokens: [FWB],
  },
})