const { sumTokensExport } = require('../helper/unwrapLPs')
const tokens = {
  "WMATIC": "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  "WETH": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  "WBTC": "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
  "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  "USDT": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
}
const POOL_DIAMOND_CONTRACT = '0xE7D96684A56e60ffBAAe0fC0683879da48daB383';

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Count every tokens under PoolDiamond management.',
  start: 1668684025,
  polygon: {
    tvl: sumTokensExport({
      owner: POOL_DIAMOND_CONTRACT,
      tokens: Object.values(tokens),
      chain: 'polygon',
    }),
  }
}
