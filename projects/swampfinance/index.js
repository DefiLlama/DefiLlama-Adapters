const { yieldHelper, } = require("../helper/yieldHelper")

module.exports = yieldHelper({
  project: 'swamp-finance',
  chain: 'bsc',
  masterchef: '0x33AdBf5f1ec364a4ea3a5CA8f310B597B8aFDee3',
  nativeToken: '0xc5A49b4CBe004b6FD55B30Ba1dE6AC360FF9765d',
  blacklistedTokens: ['0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c']
})