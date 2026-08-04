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
  'nova',
  ...sdk.chainUtils.getDeadChains()
]