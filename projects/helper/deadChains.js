const sdk = require('@defillama/sdk')

module.exports =  [
  'echelon',
  'milkomeda',
  'milkomeda_a1',
  'dexit',
  'clv',
  'fusion',
  'kardia',
  'winr',
  'plume',
  'inevm',
  'hoo',
  'rari',
  'nova',
  'csc', // CoinEx Smart Chain shut down 2026-09-29: https://www.coinex.org/?lang=en_US
  'shimmer_evm', // ShimmerEVM stopped block production 2026-09-30: https://shimmer.network/
  ...sdk.chainUtils.getDeadChains()
]