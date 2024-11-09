const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x6Af3D183d225725d975C5EaA08D442dd01Aad8fF",
        "0x953a50bd2daAa852A4Bc3E58b3AcFb95EA4E82D2",
        "0x1366Dcf0f0178802Be85d405BBeA8026EC0876c4", // binance deposited account
        "0xD5d5A7CB1807364CDE0BAd51D0a7D758943aB114"
    ],
  },
  optimism: {
    owners: [
        "0xD5d5A7CB1807364CDE0BAd51D0a7D758943aB114"
    ],
  },
  arbitrum: {
    owners: [
        "0xD5d5A7CB1807364CDE0BAd51D0a7D758943aB114"
    ],
  },
}

module.exports = treasuryExports(config)