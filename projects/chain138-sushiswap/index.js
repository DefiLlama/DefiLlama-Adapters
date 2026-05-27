// AUTO-GENERATED — scripts/defillama/generate-chain138-dex-adapters.py
// Project: chain138-sushiswap on dfio_meta_main (chainId 138)
// Regenerate after config/chain138-official-protocol-contracts.json changes.

const { getUniTVL } = require('../helper/uniswapV2');

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "Counts all liquidity in Uniswap V2 pairs created by the official factory on DeFi Oracle Meta (chainId 138).",

  dfio_meta_main: {
    tvl: getUniTVL({ factory: '0x2871207ff0d56089D70c0134d33f1291B6Fce0BE', useStableCoin: true }),
  },
};
