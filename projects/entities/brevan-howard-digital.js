const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x7D68a49754c55f1fB410F535f2b82a16f64481b6"
    ],
  },
}

module.exports = treasuryExports(config)