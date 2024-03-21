const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0xCef1B4Bf8F05F623A2A688b56d9dA679D302EBa7",
        "0x5963efF631bf3d28b68388909e2404AA6dB1e7a8", // binance deposited account
        "0x7286fCB1f0B9652063325f9d9Dc6fef092D6E711",
        "0xC5D063205C9fF82A7D060be081E238b643C0D613"
    ],
  },
  arbitrum: {
    owners: [
        "0xCef1B4Bf8F05F623A2A688b56d9dA679D302EBa7",
        "0xC5D063205C9fF82A7D060be081E238b643C0D613"
    ],
  },
  polygon: {
    owners: [
        "0xCef1B4Bf8F05F623A2A688b56d9dA679D302EBa7"
    ],
  },
}

module.exports = treasuryExports(config)