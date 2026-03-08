const { sumTokensExport } = require('../helper/solana')

// Vanish Trade — Solana privacy protocol
// Pool: 8MjKXQgj97NPVNhj9gJrQNP7BibGCGkFMVJ2qZsC58E

module.exports = {
  methodology: 'Total value of SOL held in the Vanish Trade shielded pool contract',
  solana: {
    tvl: sumTokensExport({
      solOwners: ['8MjKXQgj97NPVNhj9gJrQNP7BibGCGkFMVJ2qZsC58E'],
    }),
  },
}
