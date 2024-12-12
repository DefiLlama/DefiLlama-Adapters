const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const sydeBtcPool = "EQA2J0WCTdYdG-XeyMpPBTeu2dWB2f0oFiV4KVRfV0gewF4E"
const sydeEthPool = "EQD-7ycFO3yeh0EeT2wgXoOQmu64rdDBXqGm4nHDInPfCxJG"
const sydeEurPool = "EQDXvkuKPZahcTDRHSybwiU0E5VpiGFP2QS2iHr082JmtTT9"

module.exports = {
  methodology: 'Counts Syde smartcontract balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owners: [sydeBtcPool, sydeEthPool, sydeEurPool], tokens: [ADDRESSES.null]}),
  }
}
