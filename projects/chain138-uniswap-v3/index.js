// AUTO-GENERATED — scripts/defillama/generate-chain138-dex-adapters.py
// Project: chain138-uniswap-v3 on dfio_meta_main (chainId 138)
// Regenerate after config/chain138-official-protocol-contracts.json changes.

const { uniV3Export } = require('../helper/uniswapV3');

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "Uniswap V3 liquidity on dfio_meta_main via official factory event indexing.",

  ...uniV3Export({
    dfio_meta_main: { factory: '0x2f7219276e3ce367dB9ec74C1196a8ecEe67841C', fromBlock: 3510162 },
  }),
};
