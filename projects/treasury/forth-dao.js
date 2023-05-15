const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x223592a191ecfc7fdc38a9256c3bd96e771539a9";
const treasury2 = "0x77fba179c79de5b7653f68b5039af940ada60ce0"
const FORTH = "0x77FbA179C79De5B7653F68b5039Af940AdA60ce0";
const AMPL ="0xD46bA6D942050d489DBd938a2C909A5d5039A161"
const LP = "0xc5be99A02C6857f9Eac67BbCE58DF5572498F40c"


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//usdc
        ADDRESSES.ethereum.WETH,//weth
        '0xBcca60bB61934080951369a648Fb03DF4F96263C',//ausdc
        '0xc944E90C64B2c07662A292be6244BDf05Cda44a7'
     ],
    owners: [treasury, treasury2],
    ownTokens: [FORTH, AMPL, LP],
  },
})