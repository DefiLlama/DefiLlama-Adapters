const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x717821AAe2A45C5c5c5bcDa7A8662cD3df2385E5",

    ],
  },
  bsc: {
    owners: [
        "0x717821AAe2A45C5c5c5bcDa7A8662cD3df2385E5",
    ],
  },
}

module.exports = treasuryExports(config)