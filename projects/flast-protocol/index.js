const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs")

module.exports = {
  methodology: "Value of user deposited ETH on Flast Protocol is considered as TVL",
  hallmarks: [
    [1712880000, "Rug Pull"]
  ],
  blast: {
    tvl: sumTokensExport({ owner: '0x7474796140775d8719584AA9923102ad7bf56490', tokens: [nullAddress] }),
  },
}