const sdk = require("@defillama/sdk");

const vaultGenesisTvl = require("./vault-genesis");
const singleVaultTvl = require("./single-vault");
const leverageVaultTvl = require("./leverage-vault");

// ████ Module Exports ████████████████████████████████████████████████████

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow as leverage mechanism or to earn yield",
  arbitrum: {
    tvl: sdk.util.sumChainTvls([
      vaultGenesisTvl,
      singleVaultTvl,
      leverageVaultTvl,
    ]),
  },
};
