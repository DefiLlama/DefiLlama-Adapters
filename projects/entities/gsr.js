const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xD8D6fFE342210057BF4DCc31DA28D006f253cEF0",
    ],
  },
  bsc: {
    owners: [
        "0xD8D6fFE342210057BF4DCc31DA28D006f253cEF0",
    ],
  },
  arbitrum: {
    owners: [
        "0xD8D6fFE342210057BF4DCc31DA28D006f253cEF0",
    ],
  },
  celo: {
    owners: [
        "0xD8D6fFE342210057BF4DCc31DA28D006f253cEF0",
    ],
  },
  optimism: {
    owners: [
        "0xD8D6fFE342210057BF4DCc31DA28D006f253cEF0",
    ],
  },
  polygon: {
    owners: [
        "0xD8D6fFE342210057BF4DCc31DA28D006f253cEF0",
    ],
  },
  avax: {
    owners: [
        "0xD8D6fFE342210057BF4DCc31DA28D006f253cEF0",
    ],
  },
  moonriver: {
    owners: [
        "0xD8D6fFE342210057BF4DCc31DA28D006f253cEF0",
    ],
  },
  aurora: {
    owners: [
        "0xD8D6fFE342210057BF4DCc31DA28D006f253cEF0",
    ],
  },
}

module.exports = treasuryExports(config)