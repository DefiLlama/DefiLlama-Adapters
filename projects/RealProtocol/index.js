const { sumTokensExport } = require("../helper/unwrapLPs");
const { nullAddress } = require("../helper/tokenMapping");

// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0x259ED2C59D350E608E1018162e641186c410c31B";

module.exports = {
  ethpow: {
    tvl: sumTokensExport({ owners: [TROVE_MANAGER_ADDRESS], tokens: [nullAddress]}),
  }
};
