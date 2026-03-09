const { getTokenSupplies } = require('../helper/solana')

// Turbine — Solana privacy protocol using zSOL (wrapped SOL)
// zSOL mint: zso1EF4k8HNteye34aD8w2Fm6pYVWMDgkgWCUrMLip1
// TVL = circulating supply of zSOL (each zSOL backed 1:1 by SOL in the pool)

module.exports = {
  methodology: 'Circulating supply of zSOL tokens, each backed 1:1 by SOL deposited into Turbine privacy pools',
  solana: {
    tvl: getTokenSupplies(['zso1EF4k8HNteye34aD8w2Fm6pYVWMDgkgWCUrMLip1']),
  },
}
