const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");

const factory = "0xe185e5335d68c2a18564b4b43bdf4ed86337ee70";
const QNS = "0x37A2f8701856a78DE92DBe35dF2200c355EAe090"
const pools = [
  "0xc7e40abf6a1f6a6f79b64d86ca1960816271caca",
]

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(pools, QNS,),
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory, fetchBalances: true })
  },
};