const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology:
    "cUSD deposited in the contracts for staking & trading purpose are counted as TVL",
  celo: {
    tvl: sumTokensExport({
      owners: [
        "0xcABE1D77EC810e2A03720162749b2671621ff49C", // Dex
        "0xe61Dc5b75bBd45226FB06aC8F170Cb5624F71D51", // TriggerOrderManager
      ],
      tokens: [ADDRESSES.celo.cUSD],
    }),
  },
};
