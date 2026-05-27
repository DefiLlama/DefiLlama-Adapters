// AUTO-GENERATED — scripts/defillama/generate-chain138-dex-adapters.py
// Project: chain138-uniswap-v2 on dfio_meta_main (chainId 138)
// Regenerate after config/chain138-official-protocol-contracts.json changes.

const { getUniTVL } = require('../helper/uniswapV2');

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "Counts all liquidity in Uniswap V2 pairs created by the official factory on DeFi Oracle Meta (chainId 138).",

  dfio_meta_main: {
    tvl: getUniTVL({ factory: '0x0C30F6e67Ab3667fCc2f5CEA8e274ef1FB920279', useStableCoin: true }),
  },
};
