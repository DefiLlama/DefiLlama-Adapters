const { treasuryExports } = require("../helper/treasury");

const treasury = "0x6357EDbfE5aDA570005ceB8FAd3139eF5A8863CC";

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury],
    ownTokens: [
      "0x745407c86DF8DB893011912d3aB28e68B62E49B0", // MAHA
    ]
  },
})
