const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// StonkBase (https://www.stonkbase.xyz) — 24/7 On-Chain US Equities & ETF Trading Desk on Base (Chain ID: 8453)
const STONKBASE_STOCK_DESK = '0x71e93905da056f82f3206226ee34b9bfac830ec8'
const STONKBASE_PREDICTIONS = '0x4282b85efc3c0f42fffc4bb6ee7f4fb5a1741c54'

/**
 * Computes StonkBase Base Mainnet TVL by summing USDC held in StonkBaseStockDesk and StonkBasePredictions
 * and subtracting any protocol-funded bonusReserve() on StonkBasePredictions at the queried block.
 */
async function tvl(api) {
  const [bonusReserve] = await Promise.all([
    api.call({
      abi: 'uint256:bonusReserve',
      target: STONKBASE_PREDICTIONS,
    }),
    sumTokens2({
      api,
      owners: [STONKBASE_STOCK_DESK, STONKBASE_PREDICTIONS],
      tokens: [ADDRESSES.base.USDC],
    }),
  ])

  if (bonusReserve && BigInt(bonusReserve) > 0n) {
    api.add(ADDRESSES.base.USDC, (-BigInt(bonusReserve)).toString())
  }

  return api.getBalances()
}

module.exports = {
  methodology:
    'Counts user-deposited Circle USDC collateral locked in StonkBaseStockDesk (24/7 leveraged US stock margin positions powered by Base Mainnet Pyth Equities) and StonkBasePredictions (active parimutuel US equity opening-bell prediction rounds, excluding any protocol-funded bonusReserve) on Base Mainnet.',
  base: {
    tvl,
  },
}
