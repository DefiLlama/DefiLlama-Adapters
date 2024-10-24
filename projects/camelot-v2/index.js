const { uniV3Export } = require('../helper/uniswapV3')
const { mergeExports } = require('../helper/utils');

const export1 = uniV3Export({
  arbitrum: { factory: '0x1a3c9B1d2F0529D97f2afC5136Cc23e58f1FD35B', fromBlock: 75633510, isAlgebra: true, },
})

const export2 = uniV3Export({
  xai: { factory: '0xD8676fBdfa5b56BB2298D452c9768f51e80e34AE', fromBlock: 2398999, isAlgebra: true},
  rari: { factory: '0xcF8d0723e69c6215523253a190eB9Bc3f68E0FFa', fromBlock: 340548, isAlgebra: true},
  sanko: { factory: '0xcF8d0723e69c6215523253a190eB9Bc3f68E0FFa', fromBlock: 51, isAlgebra: true},
  arbitrum: { factory: '0xd490f2f6990c0291597fd1247651b4e0dcf684dd', fromBlock: 75633510, isAlgebra: true, },
  reya: { factory: '0x10aA510d94E094Bd643677bd2964c3EE085Daffc', fromBlock: 2932166, isAlgebra: true, },
  gravity: { factory: '0x10aA510d94E094Bd643677bd2964c3EE085Daffc', fromBlock: 11988, isAlgebra: true, },
  apechain: { factory: '0x10aA510d94E094Bd643677bd2964c3EE085Daffc', fromBlock: 60224, isAlgebra: true, },
})

module.exports = mergeExports([export1, export2 ])