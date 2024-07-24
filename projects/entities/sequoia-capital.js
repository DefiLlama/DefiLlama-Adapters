const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xb8a9a55c04e88c4a2ece06d794bcb6574706f1c4"
    ],
  },
}
module.exports = treasuryExports(config)