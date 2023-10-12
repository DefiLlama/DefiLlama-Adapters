const sdk = require("@defillama/sdk");

const vaultGenesisTvl = require("./vault-genesis");

// ████ Module Exports ████████████████████████████████████████████████████

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  // TODO: add methodology
  methodology: ``,
  arbitrum: {
    tvl: vaultGenesisTvl,
  },
};
