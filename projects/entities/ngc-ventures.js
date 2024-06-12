const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x53F470A909d7CE7f35e62f4470fD440B1eD5D8CD",
        "0xA773b135Df6265DF762709492799f31d8cE00692"
    ],
  },
  arbitrum: {
    owners: [
        "0x53F470A909d7CE7f35e62f4470fD440B1eD5D8CD",
    ],
  },
  bsc: {
    owners: [
        "0x53F470A909d7CE7f35e62f4470fD440B1eD5D8CD",
        "0xA773b135Df6265DF762709492799f31d8cE00692"
    ],
  },
  polygon: {
    owners: [
        "0x53F470A909d7CE7f35e62f4470fD440B1eD5D8CD",
    ],
  },
  avax: {
    owners: [
        "0x53F470A909d7CE7f35e62f4470fD440B1eD5D8CD",
    ],
  },
}

module.exports = treasuryExports(config)