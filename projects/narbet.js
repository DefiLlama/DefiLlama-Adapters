const { sumTokensExport, nullAddress } = require('./helper/unwrapLPs')

const ADDRESS_BANKROLL = "0x71dc4a726C92E6bf506F2Afc2Cee8B63A89B29EC"

module.exports = {
  methodology: 'NarBet TVL is the MON held in the BankrollAndStaking contract, which serves as the house liquidity pool. LPs deposit MON to earn yield from casino game outcomes across 11 on-chain games including Coin Flip, Dice/Range, Slots, Plinko, Mines, Roulette, Baccarat, Video Poker, Rock Paper Scissors, Limbo, and Fish Prawn Crab. All games use Pyth Entropy for verifiable randomness.',
  start: '2025-11-11',
  monad: {
    tvl: sumTokensExport({
      owner: ADDRESS_BANKROLL,
      tokens: [nullAddress]
    })
  }
}
