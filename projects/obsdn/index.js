const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

// Obsdn main contract holds all USDC collateral (not SpotLedger, which is the internal ledger)
const OBSDN = "0x90c3747cd4E6bC6FbebB1b3C54D99737590eBE45";

module.exports = {
  methodology:
    "TVL is the total USDC deposited as collateral in the OBSDN contract.",
  monad: {
    tvl: sumTokensExport({
      tokensAndOwners: [[ADDRESSES.monad.USDC, OBSDN]],
    }),
  },
};
