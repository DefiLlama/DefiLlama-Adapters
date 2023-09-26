const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x681148725731F213b0187A3CBeF215C291D85a3E",
        "0x20017a30d3156d4005bda08c40acda0a6ae209b1", //staked crv
        "0x3b08AA814bEA604917418A9F0907E7fC430e742C", //dao votes
    ],
  },
  optimism: {
    owners: [
        "0xa5f7a39e55d7878bc5bd754ee5d6bd7a7662355b",
        "0x3b08aa814bea604917418a9f0907e7fc430e742c"
    ],
  },
  arbitrum: {
    owners: [
        "0x3b08aa814bea604917418a9f0907e7fc430e742c"
    ],
  },
}

module.exports = treasuryExports(config)