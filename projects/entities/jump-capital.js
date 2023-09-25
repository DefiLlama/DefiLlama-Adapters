
const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xCB8EFB0c065071E4110932858A84365A80C8feF0"
        
    ],
  },
  avax: {
    owners: [
        "0xCB8EFB0c065071E4110932858A84365A80C8feF0"
        
    ],
  },
  bsc: {
    owners: [
        "0xCB8EFB0c065071E4110932858A84365A80C8feF0"
        
    ],
  },
}

module.exports = treasuryExports(config)