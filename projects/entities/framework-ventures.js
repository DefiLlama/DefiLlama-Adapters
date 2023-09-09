const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x681148725731F213b0187A3CBeF215C291D85a3E",
    ],
  },
}

module.exports = treasuryExports(config)