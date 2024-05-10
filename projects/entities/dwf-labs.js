const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xddAcAd3B1edee8E2F5b2e84f658202534fcb0374",
        "0xD4B69e8D62C880E9DD55d419d5E07435C3538342"
    ],
  },
  linea: {
    owners: [
        "0xD4B69e8D62C880E9DD55d419d5E07435C3538342"
    ],
  },
  polygon: {
    owners: [
        "0xD4B69e8D62C880E9DD55d419d5E07435C3538342",
        "0xddacad3b1edee8e2f5b2e84f658202534fcb0374"
    ],
  },
  flare: {
    owners: [
        "0xD4B69e8D62C880E9DD55d419d5E07435C3538342"
    ],
  },
  celo: {
    owners: [
        "0xddacad3b1edee8e2f5b2e84f658202534fcb0374"
    ],
  },
  bsc: {
    owners: [
        "0xddacad3b1edee8e2f5b2e84f658202534fcb0374"
    ],
  },
}

module.exports = treasuryExports(config)