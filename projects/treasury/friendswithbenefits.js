const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x33e626727B9Ecf64E09f600A1E0f5adDe266a0DF";
const FWB = "0x35bD01FC9d6D5D81CA9E055Db88Dc49aa2c699A8";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0x35bD01FC9d6D5D81CA9E055Db88Dc49aa2c699A8',//usdc
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//weth
        '0xBcca60bB61934080951369a648Fb03DF4F96263C',//ausdc
     ],
    owners: [treasury],
    ownTokens: [FWB],
  },
})