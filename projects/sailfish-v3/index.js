const { uniV3Export, uniV3GraphExport } = require('../helper/uniswapV3')

// module.exports = uniV3Export({
//   occ: { factory: '0x963A7f4eB46967A9fd3dFbabD354fC294FA2BF5C', fromBlock: 142495 },
// })

module.exports = {
  occ: {
    tvl: uniV3GraphExport({ graphURL: 'https://api.goldsky.com/api/public/project_cm1s79wa2tlb701tbchmeaflf/subgraphs/sailfish-v3-occ-mainnet/1.0.3/gn', name: 'sailfish-v3' }),
  }
}