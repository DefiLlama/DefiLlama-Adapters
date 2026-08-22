const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// BankrollVault is the only contract that custodies funds: it is the ERC-4626
// vault holding the LP bankroll (ASTROLP shares), the players' withdrawable
// balances, and the stake wagered in the round currently in play. The CrashGame
// contract never holds tokens - bets are pulled straight into the vault - so a
// single balance read covers the whole protocol without double counting.
const BANKROLL_VAULT = '0x58D2f2D46af20C357885d540A9c02fDD791Ee1CF'

module.exports = {
  methodology:
    'Counts the USDG held by the Astro BankrollVault on Robinhood Chain: the liquidity provided by LPs to the bankroll (ERC-4626 ASTROLP), the players\' withdrawable balances, and the stakes wagered in the round currently in play.',
  robinhood: {
    start: '2026-08-11', // BankrollVault deployment
    tvl: sumTokensExport({ owner: BANKROLL_VAULT, tokens: [ADDRESSES.robinhood.USDG] }),
  },
}
