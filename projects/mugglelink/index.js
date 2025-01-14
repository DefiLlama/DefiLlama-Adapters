const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

const muglelinkAddr = "UQCSo48F-bJSIq-DLve3vVNfGFmmIR-qPlKPdZ2De8c_mPbE"

module.exports = {
  methodology: 'Counts MuggleLink address balance as TVL.',
  ton: {
    tvl: sumTokensExport({ owner: muglelinkAddr, tokens: [ADDRESSES.ton.TON, ADDRESSES.ton.USDT]}),
  }
}
