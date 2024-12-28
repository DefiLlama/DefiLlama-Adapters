const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
    ],
    owners: ['0x98e6475C01D018Ae78c02ef48738f687538226Af'],
    ownTokens: ['0x7690202e2C2297bcD03664e31116d1dFfE7e3B73'],
    resolveUniV3: true,
  },
})