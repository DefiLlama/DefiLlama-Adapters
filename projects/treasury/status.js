const { treasuryExports } = require("../helper/treasury");
const { nullAddress } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    owners: [
      '0xA646E29877d52B9e2De457ECa09C724fF16D0a2B',
      '0xBBF0cC1C63F509d48a4674e270D26d80cCAF6022'
    ],
    tokens: [
        nullAddress,
    ],
    ownTokens: ["0x744d70fdbe2ba4cf95131626614a1763df805b9e"], // SNT
  },
})