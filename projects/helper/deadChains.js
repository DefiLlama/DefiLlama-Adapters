const sdk = require('@defillama/sdk')

module.exports =  [
  'echelon',
  ...sdk.chainUtils.getDeadChains()
]