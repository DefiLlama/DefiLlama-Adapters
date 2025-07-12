const { treasuryExports } = require("../helper/treasury");
const { nullAddress } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    owners: [
      '0x000a837ddd815bcba0fa91a98a50aa7a3fa62c9c',
      '0x35bb964878d7b6ddfa69cf0b97ee63fa3c9d9b49',
      '0xfd25808FFffbEf621C4DBf0171Fa647c916CB33b',
    ],
    tokens: [
        nullAddress,
    ],
    ownTokens: ["0x9DFAD1b7102D46b1b197b90095B5c4E9f5845BBA"], // Botto
  },
})