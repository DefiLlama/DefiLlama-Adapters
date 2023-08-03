const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0xCef1B4Bf8F05F623A2A688b56d9dA679D302EBa7",
        "0x5963efF631bf3d28b68388909e2404AA6dB1e7a8" // binance deposited account

    ],
  },
  arbitrum: {
    owners: [
        "0xCef1B4Bf8F05F623A2A688b56d9dA679D302EBa7"
    ],
  },
}

module.exports = cexExports(config)