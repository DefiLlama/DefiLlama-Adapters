const { sumTokens2 } = require('../helper/unwrapLPs')

// === Treasury Multisigs ===
const TREASURY_1 = "0xb5dB6e5a301E595B76F40319896a8dbDc277CEfB"  // Main DAO treasury
const TREASURY_2 = "0x1E2cD0E5905AFB73a67c497D82be271Cc65302Eb"  // Secondary treasury

// Treasury TVL: sum all tokens held in treasury multisig wallets
// This includes any dHEDGE vault tokens the treasury owns (resolveLP unwraps them)
const getTreasuryTVL = async (api) => {
  return sumTokens2({ 
    api, 
    owners: [TREASURY_1, TREASURY_2],
    resolveLP: true,  // Resolve LP tokens and dHEDGE vault tokens held by treasury
  })
}

module.exports = {
  methodology: "Tracks Infinite Trading treasury holdings across multiple chains (Ethereum, Arbitrum, Optimism, Polygon, Base) including token balances in multisig wallets. Any dHEDGE vault tokens held by the treasury are automatically unwrapped to show underlying assets.",
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
