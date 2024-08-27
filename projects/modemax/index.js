const { gmxExportsV2 } = require('../helper/gmx')
const {uniTvlExport} = require('../helper/calculateUniTvl.js')
const { mergeExports } = require('../helper/utils')

const swap = uniTvlExport('0x423A079C43e4eD7ca561Ef04765eDB796F0Ec6c6', 'mode', true)
const perp = gmxExportsV2({ eventEmitter: '0xd63352120c45378682d705f42a9F085E79E3c888', fromBlock: 25655, })

console.log(perp, swap)

const swapTvl = {
  mode: {
    tvl: swap,
  }
}
const perpTvl = {
  mode: {
    tvl: perp,
  }
}

module.exports = mergeExports(swapTvl, perpTvl)
