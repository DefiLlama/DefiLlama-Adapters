const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x24eaeCf1784c3bf9b01E011976E3D7ba917e2219", //binance deposited account
        "0x2997A7a817e4b7ff60082b948a49fDAEfc042E4e"
    ],
  },
}

module.exports = treasuryExports(config)