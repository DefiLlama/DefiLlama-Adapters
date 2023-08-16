const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x6Af3D183d225725d975C5EaA08D442dd01Aad8fF",
        "0x953a50bd2daAa852A4Bc3E58b3AcFb95EA4E82D2",
        "0x1366Dcf0f0178802Be85d405BBeA8026EC0876c4" // binance deposited account
    ],
  },
}

module.exports = cexExports(config)