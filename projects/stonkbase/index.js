const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// StonkBase (https://www.stonkbase.xyz) — 24/7 On-Chain US Equities & ETF Trading Desk on Base (Chain ID: 8453)
const STONKBASE_STOCK_DESK = '0x71e93905da056f82f3206226ee34b9bfac830ec8'
const STONKBASE_PREDICTIONS = '0x4282b85efc3c0f42fffc4bb6ee7f4fb5a1741c54'
const STONKBASE_VAULT = '0x0c8bf2feeda51a5c8bd6a3ba34a149a7b8af63ac'
const STONKBASE_STACK_PLAN = '0xa0cb7b38ad0d0efaad66fec0df551a57fa271b6e'
const STONKBASE_STACK_POOL = '0x7fddea2d16433d0810798104299197e277ae464c'

module.exports = {
  methodology:
    'Counts Circle USDC collateral locked in StonkBaseStockDesk (24/7 leveraged US stock margin positions powered by Base Mainnet Pyth Equities), StonkBasePredictions (Call the Open parimutuel US equity opening-bell prediction rounds and bonus reserves), and StonkBase Vault and Stack contracts on Base Mainnet.',
  base: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          STONKBASE_STOCK_DESK,
          STONKBASE_PREDICTIONS,
          STONKBASE_VAULT,
          STONKBASE_STACK_PLAN,
          STONKBASE_STACK_POOL,
        ],
        tokens: [ADDRESSES.base.USDC],
      }),
  },
}
