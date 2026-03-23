const { sumTokens2 } = require('../helper/unwrapLPs')

// === Treasury Multisigs ===
const TREASURY_1 = "0xb5dB6e5a301E595B76F40319896a8dbDc277CEfB"  // Main DAO treasury

// === Revenue Wallet (API Cost Revenue) ===
// This wallet receives ongoing API cost fees from users across multiple chains
// (Base, Optimism, Polygon, Arbitrum, Ethereum)
const API_COST_REVENUE = "0x1E2cD0E5905AFB73a67c497D82be271Cc65302Eb"  // API Cost revenue wallet

// Treasury TVL: sum all tokens held in treasury multisig wallets
// This includes any dHEDGE vault tokens the treasury owns (resolveLP unwraps them)
// Also includes the API Cost revenue wallet which accumulates fees from API usage
const getTreasuryTVL = async (api) => {
  return sumTokens2({ 
    api, 
    owners: [TREASURY_1, API_COST_REVENUE],
    resolveLP: true,  // Resolve LP tokens and dHEDGE vault tokens held by treasury
  })
}

module.exports = {
  methodology: "Tracks Infinite Trading treasury holdings across multiple chains (Ethereum, Arbitrum, Optimism, Polygon, Base) including token balances in multisig wallets. The API Cost revenue wallet (0x1E2cD0E5905AFB73a67c497D82be271Cc65302Eb) receives ongoing fees from users for API usage across all supported chains. Any dHEDGE vault tokens held by the treasury are automatically unwrapped to show underlying assets.",
  optimism: {
    tvl: getTreasuryTVL,
  },
  ethereum: {
    tvl: getTreasuryTVL,
  },
  arbitrum: {
    tvl: getTreasuryTVL,
  },
  polygon: {
    tvl: getTreasuryTVL,
  },
  base: {
    tvl: getTreasuryTVL,
  },
}
