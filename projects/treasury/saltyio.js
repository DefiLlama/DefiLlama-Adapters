const { treasuryExports } = require("../helper/treasury");

const treasury = "0x35fdBd5b52D131629EA5403FF1bc7ff6A1869D60" //

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury],
    ownTokens: ['0x0110B0c3391584Ba24Dbf8017Bf462e9f78A6d9F']
  },
})