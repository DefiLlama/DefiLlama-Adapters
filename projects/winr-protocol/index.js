const { sumTokensExport } = require('../helper/unwrapLPs')

const WINR = '0xD77B108d4f6cefaa0Cae9506A934e825BEccA46E'

// Bankroll vault - liquidity provider funds backing gameplay
const WINR_BANKROLL = '0x5eD22F7693fea5A0B45dB31771aa94E941b6df8a'

// Escrow - user balances, settled on-chain via merkle roots
const WINR_ESCROW = '0xD75a51364440dAF83B78B9888D2b8F28eaC0D280'

module.exports = {
  methodology:
    'TVL is the tracked Arbitrum value of WINR held in the protocol bankroll vault and escrow contract. The bankroll holds liquidity provider funds backing all JustBet gameplay; the escrow holds user balances, settled on-chain via merkle roots. Prior-generation USDC contracts and the separate staking contract are excluded from this export.',
  arbitrum: {
    tvl: sumTokensExport({
      owners: [WINR_BANKROLL, WINR_ESCROW],
      tokens: [WINR],
    }),
  },
}
