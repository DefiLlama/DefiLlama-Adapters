const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x19a504b1096aE59624105E737B22F5943B1a4846",

    ],
  },
}

module.exports = treasuryExports(config)