const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xfbf335f8224a102e22abe78d78cc52dc95e074fa" //2.6m$ on convex
    ],
  },
  bsc: {
    owners: [
        "0xFBf335f8224a102e22abE78D78CC52dc95e074Fa",
    ],
  },
  fantom: {
    owners: [
        "0xFBf335f8224a102e22abE78D78CC52dc95e074Fa",
    ],
  },
  optimism: {
    owners: [
        "0xFBf335f8224a102e22abE78D78CC52dc95e074Fa",
    ],
  },
  avax: {
    owners: [
        "0xFBf335f8224a102e22abE78D78CC52dc95e074Fa",
    ],
  },
}

module.exports = treasuryExports(config)