const { treasuryExports } = require("../helper/treasury");

const treasury = "0x54C56e149F6D655Aa784678057D1f96612b0Cf1a";

module.exports = treasuryExports({
  berachain: {
    tokens: [
        "0xF961a8f6d8c69E7321e78d254ecAfBcc3A637621"
     ],
    owners: [treasury],
    ownTokens: [],
  },
})
