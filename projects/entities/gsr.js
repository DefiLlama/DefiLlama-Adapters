const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xD8D6fFE342210057BF4DCc31DA28D006f253cEF0",
    ],
  },
  bsc: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
    ],
  },
  arbitrum: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
    ],
  },
  celo: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
    ],
  },
  optimism: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
    ],
  },
  polygon: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
    ],
  },
  avax: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
    ],
  },
  moonriver: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
    ],
  },
  aurora: {
    owners: [
        "0xEaf3B28A87D498530cDC7f0700E70502CF896D3f",
    ],
  },
}

module.exports = treasuryExports(config)