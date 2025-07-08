const ADDRESSES = require('../helper/coreAssets.json')
const { yieldHelper, } = require("../helper/yieldHelper")

module.exports = yieldHelper({
  project: 'swamp-finance',
  chain: 'bsc',
  masterchef: '0x33AdBf5f1ec364a4ea3a5CA8f310B597B8aFDee3',
  nativeToken: '0xc5A49b4CBe004b6FD55B30Ba1dE6AC360FF9765d',
  blacklistedTokens: [ADDRESSES.bsc.BTCB, ADDRESSES.bsc.ETH]
})