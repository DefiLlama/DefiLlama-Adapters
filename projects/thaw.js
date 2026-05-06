const { sumTokensExport, nullAddress } = require('./helper/unwrapLPs')

const ADDRESS_BANKROLL = "0xf2fe0D4D898fb934510b0128d2EA01564C5ED3F1"

module.exports = {
  methodology: 'Thaw TVL is the HYPE held in the BankrollAndStaking contract, which serves as the house liquidity pool for all casino games. Liquidity providers deposit HYPE to earn yield from game outcomes across 6 on-chain games including Coin Flip, Range, Slots, Plinko, Rock Paper Scissors, and Baccarat. All games use Pyth Entropy for provably fair randomness.',
  start: '2026-04-25',
  hyperliquid: {
    tvl: sumTokensExport({
      owner: ADDRESS_BANKROLL,
      tokens: [nullAddress]
    })
  }
}
