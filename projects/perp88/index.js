const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const tokens = {
  "WMATIC": ADDRESSES.polygon.WMATIC_2,
  "WETH": ADDRESSES.polygon.WETH_1,
  "WBTC": ADDRESSES.polygon.WBTC,
  "DAI": ADDRESSES.polygon.DAI,
  "USDC": ADDRESSES.polygon.USDC,
  "USDT": ADDRESSES.polygon.USDT
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
