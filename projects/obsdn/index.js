const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const SPOT_LEDGER = "0x8d156514dE27823436212bFcA3064Ba1e5236723";

module.exports = {
  methodology:
    "TVL is the total USDC deposited as collateral in the OBSDN SpotLedger contract.",
  monad: {
    tvl: sumTokensExport({
      tokensAndOwners: [[ADDRESSES.monad.USDC, SPOT_LEDGER]],
    }),
  },
};
