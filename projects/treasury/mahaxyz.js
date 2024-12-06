const { treasuryExports } = require("../helper/treasury");

const treasury = "0x6357EDbfE5aDA570005ceB8FAd3139eF5A8863CC";

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury],
    ownTokens: [
      "0x745407c86DF8DB893011912d3aB28e68B62E49B0", // MAHA
    ],
    blacklistedTokens: [
      "0xB4d930279552397bbA2ee473229f89Ec245bc365", // MAHA
      "0x6b7127a638eDC7Db04bEde220c7c49930fdB4160" // MAHAETH
    ],
  },
})
