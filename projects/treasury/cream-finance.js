const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x6D5a7597896A703Fe8c85775B23395a48f971305";
const CREAM = "0x2ba592F78dB6436527729929AAf6c908497cB200";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xc00e94Cb662C3520282E6f5717214004A7f26888",//comp
        "0x49D72e3973900A195A155a46441F0C08179FdB64",//CRETH2
     ],
    owners: [treasury],
    ownTokens: [CREAM],
  },
})
