const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x9c3afddea87a726891a44c037242393d524cacfe'

module.exports = uniV3Export({
  arbitrum: { factory, fromBlock: 136869578, },
  aurora: { factory, fromBlock: 103003665, },
  avax: { factory, fromBlock: 26354078, },
  base: { factory, fromBlock: 4842033, },
  core: { factory, fromBlock: 8098971, },
  conflux: { factory, fromBlock: 81225485, },
  elastos: { factory, fromBlock: 21155070, },
  ethereum: { factory, fromBlock: 18244533, },
  fantom: { factory, fromBlock: 68867215, },
  flare: { factory, fromBlock: 13870179, },
  fuse: { factory, fromBlock: 25858644, },
  kcc: { factory, fromBlock: 25009540, },
  klaytn: { factory, fromBlock: 135016953, },
  linea: { factory, fromBlock: 555725, },
  moonbeam: { factory, fromBlock: 4603904, },
  moonriver: { factory, fromBlock: 5278912, },  
  op_bnb: { factory, fromBlock: 33770963, },
  optimism: { factory, fromBlock: 110550634, },
  polygon: { factory, fromBlock: 5958239, },
  polygon_zkevm: { factory, fromBlock: 48172130, },
  telos: { factory, fromBlock: 304359939, }
})
