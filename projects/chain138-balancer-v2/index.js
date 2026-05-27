// AUTO-GENERATED — scripts/defillama/generate-chain138-dex-adapters.py
// Project: chain138-balancer-v2 on dfio_meta_main (chainId 138)
// Regenerate after config/chain138-official-protocol-contracts.json changes.

const { sumTokensExport } = require('../helper/unwrapLPs');

const VAULT = '0x96423d7C1727698D8a25EbFB88131e9422d1a3C3';

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "Balancer V2 vault ERC-20 balances on dfio_meta_main (official vault deployment).",

  dfio_meta_main: {
    tvl: sumTokensExport({
      owner: VAULT,
      fetchCoValentTokens: true,
      logCalls: true,
    }),
  },
};
