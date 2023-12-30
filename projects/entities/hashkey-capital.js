const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x760484042a7856E62B627318796Ebb609C8131a1", 
    ],
  },
  moonbeam: {
    owners: [
        "0x760484042a7856E62B627318796Ebb609C8131a1", 
    ],
  },
  avax: {
    owners: [
        "0x760484042a7856E62B627318796Ebb609C8131a1", 
    ],
  },
  bsc: {
    owners: [
        "0x760484042a7856E62B627318796Ebb609C8131a1", 
    ],
  },
  polygon: {
    owners: [
        "0x760484042a7856E62B627318796Ebb609C8131a1", 
    ],
  },
  moonriver: {
    owners: [
        "0x760484042a7856E62B627318796Ebb609C8131a1", 
    ],
  },
  optimism: {
    owners: [
        "0x760484042a7856E62B627318796Ebb609C8131a1", 
    ],
  },
  arbitrum: {
    owners: [
        "0x760484042a7856E62B627318796Ebb609C8131a1", 
    ],
  },
}

module.exports = treasuryExports(config)