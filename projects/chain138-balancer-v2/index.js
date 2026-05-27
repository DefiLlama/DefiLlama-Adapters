// AUTO-GENERATED — scripts/defillama/generate-chain138-dex-adapters.py
// Project: chain138-balancer-v2 on dfio_meta_main (chainId 138)
// Regenerate after config/chain138-official-protocol-contracts.json changes.

const { v2 } = require('../helper/balancer');

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "Balancer V2 vault TVL on dfio_meta_main (official vault deployment address).",

  dfio_meta_main: {
    tvl: v2.tvl({ vault: '0x96423d7C1727698D8a25EbFB88131e9422d1a3C3' }),
  },
};
