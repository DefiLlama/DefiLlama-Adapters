
const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const sydeBtcPool = "EQBm9Ns0p98h74liNdYn-jOnJ79BT5cm--LIAeoYlfeWzQOk"
const sydeEthPool = "EQCo4FcMyezTvv2xOY-6iW4AAGahV2u8tkMxVT90gDz0sk5t"
const sydeEurPool = "EQC9H5G-VrnnwFa60pn08t5EqNMREW8NscnqL13W2jl9je4P"

module.exports = {
  methodology: 'Counts Syde smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owners: [sydeBtcPool, sydeEthPool, sydeEurPool], tokens: [ADDRESSES.null]}),
  }
}