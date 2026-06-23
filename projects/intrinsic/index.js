// Intrinsic — Uniswap v3 concentrated-liquidity DEX on Rootstock (rsk).
// TVL = tokens locked across all Intrinsic v3 pools, enumerated from the
// factory's PoolCreated events. BPD is priced via the DefiLlama-server
// tokenMapping (BPD -> tether), so both sides of the BPD/USD₮0 pool count.
const { uniV3Export } = require('../helper/uniswapV3')

module.exports = {
  methodology: 'Counts tokens locked in all Intrinsic v3 pools, enumerated from the factory PoolCreated events (uniV3Export helper).',
  start: 1764806400, // factory deploy ~2025-12-04
  ...uniV3Export({ rsk: { factory: '0x82dF0a279767021734EcE752979B34b3959C25D8', fromBlock: 8275250 } }),
}
