const { treasuryExports } = require("../helper/treasury")

const config = {
  ethereum: {
    owners: [
        "0x8767d65677cabad2050b764aef40610f2f9796f5",
        "0xfa12342e6Dd367CC3884ca68EDfcC5e015bd68D1",
        "0xaea97b739dcd6f5b586586cb7a538d60ba96a757",
        "0x1f9e17D8C21b00d2BbdfE637C33db21c3B1F4E4e"
    ],
    tokens: ["0x29C827Ce49aCCF68A1a278C67C9D30c52fBbC348"], //sushi lp
    resolveUniV3: true,
  },
  avax: {
    owners: [
        "0x8767d65677cabad2050b764aef40610f2f9796f5",      
        "0x1f9e17D8C21b00d2BbdfE637C33db21c3B1F4E4e"
    ],
  },
}
module.exports = treasuryExports(config)