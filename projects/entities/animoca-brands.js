const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xd6AF301A8770659c1Dc880843db4d1aaA01048b4",
        "0xE929c67Db94f5b1541FB241eB3E5CbC6468c37e6", //binance deposited account
        "0xbDCb95A80d4C770fa811B1FAF0bb4Cf204d310b5",
        "0x2D2140E7159b6Cb1f82dC4cfd244A6C8aeE215FC"
    ],
  },
  polygon: {
    owners: [
        "0xbDCb95A80d4C770fa811B1FAF0bb4Cf204d310b5"
    ],
  },
  bsc: {
    owners: [
        "0xbDCb95A80d4C770fa811B1FAF0bb4Cf204d310b5"
    ],
  },
}

module.exports = treasuryExports(config)