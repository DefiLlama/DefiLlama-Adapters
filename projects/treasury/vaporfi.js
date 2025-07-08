const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryContract = "0x20b0013dcBB9697a8C3D0Be2cfb004d6bD023B87";
const WAVAX_VPND_JPL = "0x4cd20F3e2894Ed1A0F4668d953a98E689c647bfE";
const VPND = "0x83a283641C6B4DF383BCDDf807193284C84c5342";


module.exports = treasuryExports({
  avax: {
    tokens: [ 
        nullAddress
     ],
    owners: [treasuryContract],
    ownTokens: [VPND,WAVAX_VPND_JPL],
  },
})
