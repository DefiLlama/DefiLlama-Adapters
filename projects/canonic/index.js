const { sumTokens2 } = require('../helper/unwrapLPs')

// MegaETH Mainnet token addresses
const WETH  = '0x4200000000000000000000000000000000000006'
const USDM  = '0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7'
const BTC_B = '0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072'
const USDT0 = '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb'

// MAOB (orderbook) contracts hold all resting liquidity
const MAOB_BTC_USDM  = '0xaD7e5CBfB535ceC8d2E58Dca17b11d9bA76f555E'
const MAOB_WETH_USDM = '0x23469683e25b780DFDC11410a8e83c923caDF125'
const MAOB_USDT0_USDM = '0xDf1576c3C82C9f8B759C69f4cF256061C6Fe1f9e'

// CLP vault contracts hold free (undeployed) liquidity
const CLP_BTC_USDM  = '0x26F35fcbA3C1387dBaC477d82Bb8a66fA2eDfb4E'
const CLP_WETH_USDM = '0x11469caf743C2bFBD663C42A2E339A75E053075C'
const CLP_USDT0_USDM = '0xC397f8ffd517EDA78da4dE59c53516B65846a82A'

/**
 * Calculates Canonic protocol TVL by summing balanceOf for base and quote
 * tokens across all MAOB orderbook and CLP vault contracts on MegaETH.
 * @param {object} api - DefiLlama SDK ChainApi instance.
 * @returns {Promise<object>} Token balances keyed by address.
 */
async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      // MAOB orderbooks (includes CLP-deployed orders)
      [BTC_B, MAOB_BTC_USDM],
      [USDM,  MAOB_BTC_USDM],
      [WETH,  MAOB_WETH_USDM],
      [USDM,  MAOB_WETH_USDM],
      [USDT0, MAOB_USDT0_USDM],
      [USDM,  MAOB_USDT0_USDM],
      // CLP vaults (free/undeployed funds only)
      [BTC_B, CLP_BTC_USDM],
      [USDM,  CLP_BTC_USDM],
      [WETH,  CLP_WETH_USDM],
      [USDM,  CLP_WETH_USDM],
      [USDT0, CLP_USDT0_USDM],
      [USDM,  CLP_USDT0_USDM],
    ],
  })
}

module.exports = {
  methodology: 'TVL is the sum of all tokens held in MAOB orderbook contracts and CLP liquidity vault contracts on MegaETH.',
  megaeth: { tvl },
}
