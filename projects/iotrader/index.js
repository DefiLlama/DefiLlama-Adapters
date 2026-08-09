const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const VAULT = "0xf89d7b9c864f589bbF53a82105107622B35EaA40";

module.exports = {
  methodology:
    "TVL is the total value of BNB and supported collateral tokens held in IOTrader smart contracts on BNB Smart Chain.",
  bsc: {
    tvl: sumTokensExport({
      owners: [VAULT],
      tokens: [
        ADDRESSES.null,
        ADDRESSES.bsc.USDC,
        ADDRESSES.bsc.USDT,
      ],
    }),
  },
};
