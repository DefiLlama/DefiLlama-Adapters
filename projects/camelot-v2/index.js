const { uniV3Export } = require('../helper/uniswapV3')
const { mergeExports } = require('../helper/utils');

const export1 = uniV3Export({
  arbitrum: { factory: '0x1a3c9B1d2F0529D97f2afC5136Cc23e58f1FD35B', fromBlock: 75633510, isAlgebra: true, blacklistedTokens: ['0xf3527ef8de265eaa3716fb312c12847bfba66cef', '0x7788a3538c5fc7f9c7c8a74eac4c898fc8d87d92', '0x8467f85a834159c26227b21f9898ca0fa606eaa8'] },
})

const export2 = uniV3Export({
  xai: { factory: '0xD8676fBdfa5b56BB2298D452c9768f51e80e34AE', fromBlock: 2398999, isAlgebra: true },
  rari: { factory: '0xcF8d0723e69c6215523253a190eB9Bc3f68E0FFa', fromBlock: 340548, isAlgebra: true },
  sanko: { factory: '0xcF8d0723e69c6215523253a190eB9Bc3f68E0FFa', fromBlock: 51, isAlgebra: true },
  arbitrum: { factory: '0xd490f2f6990c0291597fd1247651b4e0dcf684dd', fromBlock: 75633510, isAlgebra: true, },
  reya: { factory: '0x10aA510d94E094Bd643677bd2964c3EE085Daffc', fromBlock: 2932166, isAlgebra: true, },
  gravity: { factory: '0x10aA510d94E094Bd643677bd2964c3EE085Daffc', fromBlock: 11988, isAlgebra: true, },
  apechain: { factory: '0x10aA510d94E094Bd643677bd2964c3EE085Daffc', fromBlock: 60224, isAlgebra: true, },
  duckchain: { factory: '0xCf4062Ee235BbeB4C7c0336ada689ed1c17547b6', fromBlock: 1530060, isAlgebra: true, },
  occ: { factory: '0xCf4062Ee235BbeB4C7c0336ada689ed1c17547b6', fromBlock: 21053, isAlgebra: true, },
  spn: { factory: '0xCf4062Ee235BbeB4C7c0336ada689ed1c17547b6', fromBlock: 1, isAlgebra: true, },
  winr: { factory: '0x10aA510d94E094Bd643677bd2964c3EE085Daffc', fromBlock: 1258618, isAlgebra: true }
})

module.exports = mergeExports([export1, export2])

