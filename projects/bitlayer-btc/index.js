const { sumTokensExport } = require("../helper/sumTokens");
const { bitlayerBridge } = require("../helper/bitcoin-book");

module.exports = {
  bitcoin: {
    tvl: sumTokensExport({ owners: bitlayerBridge })
  },
};
