const sdk = require('@defillama/sdk')

module.exports =  [
  ...sdk.chainUtils.getDeadChains()
]