const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owner: "0xcde3f99bcb4c91e19124e41730489eaefec24565", tokens: [ADDRESSES.arbitrum.USDC_CIRCLE] }),
  },
};

module.exports.methodology = "Counts tokens held in the TxFlow system wallet on Arbitrum.";
