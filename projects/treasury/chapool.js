const { treasuryExports } = require("../helper/treasury");
const ADDRESSES = require("../helper/coreAssets.json")

module.exports = treasuryExports({
  op_bnb: {
    tokens: [
      ADDRESSES.op_bnb.USDT,
    ],
    owners: ['0xEe83640f0ed07d36E799531CC6d87FB4CDcCaC13'],
  },
})