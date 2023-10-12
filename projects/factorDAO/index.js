const sdk = require("@defillama/sdk");

const vaultGenesisTvl = require("./vault-genesis");
const singleVaultTvl = require("./single-vault");

// ████ Module Exports ████████████████████████████████████████████████████

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  // TODO: add methodology
  methodology: ``,
  arbitrum: {
    tvl: sdk.util.sumChainTvls([vaultGenesisTvl, singleVaultTvl]),
  },
};
