
const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xCB8EFB0c065071E4110932858A84365A80C8feF0",
        "0x4F20Cb7a1D567A54350a18DAcB0cc803aEBB4483",
        "0xaA4237995A8DDb6FC30C3C5bC4Cb9C0c15eE7C4F",
        "0xe198c2FE9Ff0A1CBcDeE96A5A3e4ccd8DE707AB0"
    ],
  },
  avax: {
    owners: [
        "0xCB8EFB0c065071E4110932858A84365A80C8feF0",
        "0xe198c2FE9Ff0A1CBcDeE96A5A3e4ccd8DE707AB0"
    ],
  },
  bsc: {
    owners: [
        "0xCB8EFB0c065071E4110932858A84365A80C8feF0",
        "0x4F20Cb7a1D567A54350a18DAcB0cc803aEBB4483",
        "0xaA4237995A8DDb6FC30C3C5bC4Cb9C0c15eE7C4F",
        "0xe198c2FE9Ff0A1CBcDeE96A5A3e4ccd8DE707AB0"
    ],
  },
  polygon: {
    owners: [
        "0x4F20Cb7a1D567A54350a18DAcB0cc803aEBB4483",
        "0xaA4237995A8DDb6FC30C3C5bC4Cb9C0c15eE7C4F"
    ],
  },
  arbitrum: {
    owners: [
        "0x4F20Cb7a1D567A54350a18DAcB0cc803aEBB4483"
    ],
  },
}

module.exports = treasuryExports(config)