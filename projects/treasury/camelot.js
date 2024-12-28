
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x03ff2d78afb69e0859ec6beb4cf107d3741e97ab";

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury, ],
    ownTokens: [   
      '0x3d9907f9a368ad0a51be60f7da3b97cf940982d8',
     ],
    tokens: [
      '0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60',
    ],
  },
});