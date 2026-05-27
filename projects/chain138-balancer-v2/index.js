// AUTO-GENERATED — scripts/defillama/generate-chain138-dex-adapters.py
// Project: chain138-balancer-v2 on dfio_meta_main (chainId 138)
// Regenerate after config/chain138-official-protocol-contracts.json changes.

const { sumTokensExport } = require('../helper/unwrapLPs');

const VAULT = '0x96423d7C1727698D8a25EbFB88131e9422d1a3C3';
const HUB_TOKENS = [
  '0x93E66202A11B1772E55407B32B44e5Cd8eda7f22', // cUSDT
  '0xf22258f57794CC8E06237084b353Ab30fFfa640b', // cUSDC
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH9
];

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "Balancer V2 vault ERC-20 balances on dfio_meta_main (official vault deployment).",

  dfio_meta_main: {
    tvl: sumTokensExport({
      owner: VAULT,
      tokens: HUB_TOKENS,
      logCalls: true,
    }),
  },
};
