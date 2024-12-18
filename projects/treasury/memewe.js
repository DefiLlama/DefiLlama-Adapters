const { nullAddress, treasuryExports } = require("../helper/treasury");


module.exports = treasuryExports({
  base: {
    owners: [
        '0xFfC60ed4c5ee48beb646dD81521842A4a4d19980', 
    ],
    tokens: [
        nullAddress,
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    ],
    ownTokens: [],
  },
})