const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xFcbf806792f06d9c78E50B3737E1a22cfC36a942",
        "0x9413Da1bC1797179e5D019A9420cEEc44680A4bf"
    ],
  },
  bsc: {
    owners: [
        "0x9413Da1bC1797179e5D019A9420cEEc44680A4bf",
        '0xFcbf806792f06d9c78E50B3737E1a22cfC36a942'
    ],
  },
  arbitrum: {
    owners: [
        "0x9413Da1bC1797179e5D019A9420cEEc44680A4bf",
    ],
  },
  polygon: {
    owners: [
        "0x9413Da1bC1797179e5D019A9420cEEc44680A4bf",
    ],
  },
}

module.exports = treasuryExports(config)