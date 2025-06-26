const { treasuryExports } = require("../helper/treasury");
const { nullAddress } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    owners: ['0xA646E29877d52B9e2De457ECa09C724fF16D0a2B'],
    tokens: [
        nullAddress,
    ],
    ownTokens: ["0x744d70fdbe2ba4cf95131626614a1763df805b9e"], // SNT
  },
})