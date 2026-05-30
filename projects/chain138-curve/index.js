// AUTO-GENERATED — scripts/defillama/generate-chain138-dex-adapters.py
// Project: chain138-curve on dfio_meta_main (chainId 138)
// Regenerate after config/chain138-defillama-adapter-registry.json changes.

const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "Curve-style stable pool balances on dfio_meta_main (ThreePool contract).",

  dfio_meta_main: {
    tvl: sumTokensExport({ owner: '0xE440Ec15805BE4C7BabCD17A63B8C8A08a492e0f', resolveLP: true }),
  },
};
