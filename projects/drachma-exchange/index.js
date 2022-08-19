const { sumTokens2, } = require("../helper/solana");

async function tvl() {
  return sumTokens2({
    tokensAndOwners: [
      ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 'J1bMZJc4aj6RZVTf5vjDBwrwgoRAnvttkhU4TviuqrtL'],
      ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'J1bMZJc4aj6RZVTf5vjDBwrwgoRAnvttkhU4TviuqrtL'],
      ['USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX', 'J1bMZJc4aj6RZVTf5vjDBwrwgoRAnvttkhU4TviuqrtL'],
    ]
  })
}

module.exports = {
  methodology:
    "drachma exchange TVL is computed by looking at the balances of the accounts holding the tokens backing the drachma vault user. The data comes from https://drachma.exchange/pool.",
  solana: {
    tvl
  },
};
