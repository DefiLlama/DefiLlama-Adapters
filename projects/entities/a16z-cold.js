const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x7D325A9C8F10758188641FE91cFD902499edC782", 
        "0x2B1Ad6184a6B0fac06bD225ed37C2AbC04415fF4",
        "0x05E793cE0C6027323Ac150F6d45C2344d28B6019", //14k MKR staking
        "0x0f50D31B3eaefd65236dd3736B863CfFa4c63C4E"
    ],
  },
}

module.exports = treasuryExports(config)