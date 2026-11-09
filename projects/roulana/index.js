const { sumTokens2 } = require('../helper/solana')

// Roulana: one live European roulette table on Solana (https://roulana.com). Players bet USDC from their own safe in the
// table's program, and the bank that pays the wins is funded by investors who own it in shares. All the USDC the program
// holds (the bank, the players' safes and the fees not yet paid out) sits in one vault token account owned by the table.
const VAULT = 'BPJmrTZFCBi4iK6bA4FxV43wM1qQqiHXBGMHbfd4aw56'

async function tvl(api) {
  return sumTokens2({ api, tokenAccounts: [VAULT] })
}

module.exports = {
  methodology: "TVL is the USDC held in the Roulana table program's vault: the bank funded by its investors, the players' own safes, and fees not yet paid out.",
  solana: { tvl },
}
