const { sumTokensExport } = require('../helper/unwrapLPs')

const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' // native USDC, Arbitrum One
const COLLATERAL_VAULT = '0xAfE63c71bA1D70992C9d7B01c0F1eD5c51941a8f' // MWM CollateralVault

module.exports = {
  methodology: 'USDC collateral deposited in the MWM CollateralVault',
  arbitrum: {
    tvl: sumTokensExport({ owner: COLLATERAL_VAULT, tokens: [USDC] }),
  },
}
