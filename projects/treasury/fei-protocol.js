const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x8d5ed43dca8c2f7dfb20cf7b53cc7e593635d7b9";
const TRIBE = "0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
    ownTokens: [TRIBE],
  },
})