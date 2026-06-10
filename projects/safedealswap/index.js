const { sumTokensExport } = require("../helper/unwrapLPs");

const SAFEDEALSWAP_CONTRACT = "0xFc3860113b14F592257E325117b4b7a63464E480";
const USDT = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const RUCOIN = "0x4d870Ae52e61d4FB6e125f4380cC0c0F9f15A575";

module.exports = {
  methodology: "Counts the value of USDT and RuCoin tokens locked in SafeDealSwap P2P OTC contract on Polygon.",
  polygon: {
    tvl: sumTokensExport({
      owner: SAFEDEALSWAP_CONTRACT,
      tokens: [USDT, RUCOIN],
    }),
  },
};
