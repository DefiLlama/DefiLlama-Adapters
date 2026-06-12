const { sumTokensExport } = require("../helper/unwrapLPs");
const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

const SAFEDEALSWAP_CONTRACT = "0xFc3860113b14F592257E325117b4b7a63464E480";
const RUCOIN = "0x4d870Ae52e61d4FB6e125f4380cC0c0F9f15A575";

module.exports = {
  methodology: "Counts the value of USDT and RuCoin tokens locked in SafeDealSwap P2P OTC contract on Polygon.",
  polygon: {
    tvl: sumTokensExport({ owner: SAFEDEALSWAP_CONTRACT, tokens: [ADDRESSES.polygon.USDT] }),
    staking: staking(SAFEDEALSWAP_CONTRACT, RUCOIN)
  },
};
