
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xc9032419aa502fafa107775dca8b7d07575d9db5";

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury, ],
    ownTokens: [   
      '0xa684cd057951541187f288294a1e1c2646aa2d24', // 
     ],
    tokens: [
      nullAddress,
      '0x625e7708f30ca75bfd92586e17077590c60eb4cd',
      '0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1',
    ],
  },
});