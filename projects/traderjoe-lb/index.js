const { joeV2Export } = require('../helper/traderJoeV2')

const factories = {
  avax: { factory: '0x6e77932a92582f504ff6c4bdbcef7da6c198aeef', isLb: true },
  arbitrum: { factory: '0x1886d09c9ade0c5db822d85d21678db67b6c2982', isLb: true },
  bsc: { factory: '0x43646a8e839b2f2766392c1bf8f60f6e587b6960', isLb: true },
}

module.exports = joeV2Export(factories)