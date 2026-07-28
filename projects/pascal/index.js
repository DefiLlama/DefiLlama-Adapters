const { sumTokensExport } = require('../helper/solana')

// Pascal — prediction market exchange on Solana.
// Users deposit native USDC as collateral into a single program-owned vault
// token account. TVL is the USDC balance held in that vault.
const VAULT_TOKEN_ACCOUNT = '5vRGRcwN4iYaiQdso1vgWbTDFYbS8GQNUDRMMKE2ycZS'

module.exports = {
  methodology:
    'TVL is the USDC collateral held in Pascal\'s vault token account on Solana.',
  solana: {
    tvl: sumTokensExport({ tokenAccounts: [VAULT_TOKEN_ACCOUNT] }),
  },
}