const { sumTokensExport } = require('../helper/solana')

// Veil (veilit.xyz): a zero-knowledge shielded pool on Solana. Program FmsMbXrQXr1mARn45Cm52sdrwAWHDxqF8473t6woq9DP.
// Every token's vault is a token account owned by the program's single PDA, seeds ["vault_authority"].
const VAULT_AUTHORITY = 'A8Qjyh2nWgEUkTQAAmghxE7u7nJ4xarQybDpTxWJdU4S'
// $VEIL, the protocol's own token, is left out of TVL.
const VEIL = 'HgTGdc29D5bDMrDvsCLnorxz899VyDj7ZN7FPa6vpump'

module.exports = {
  timetravel: false,
  methodology: "Tokens held in Veil's shielded-pool vaults: every SPL and Token-2022 vault is owned by the program's vault_authority PDA. The protocol's own token, $VEIL, is excluded.",
  solana: {
    tvl: sumTokensExport({ owner: VAULT_AUTHORITY, blacklistedTokens: [VEIL] }),
  },
}
