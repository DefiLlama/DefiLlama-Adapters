const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// StonkBase (https://www.stonkbase.xyz) — 24/7 On-Chain US Equities & ETF Trading Desk on Base (Chain ID: 8453)
const STONKBASE_STOCK_DESK = '0x71e93905da056f82f3206226ee34b9bfac830ec8'
const STONKBASE_PREDICTIONS = '0x4282b85efc3c0f42fffc4bb6ee7f4fb5a1741c54'

module.exports = {
  methodology:
    'Counts user-deposited Circle USDC collateral locked in StonkBaseStockDesk (24/7 leveraged US stock margin positions powered by Base Mainnet Pyth Equities) and StonkBasePredictions (active parimutuel US equity opening-bell prediction rounds) on Base Mainnet.',
  base: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [STONKBASE_STOCK_DESK, STONKBASE_PREDICTIONS],
        tokens: [ADDRESSES.base.USDC],
      }),
  },
}
