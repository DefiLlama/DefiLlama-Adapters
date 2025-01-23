const { gmxExportsV2 } = require('../helper/gmx.js')

module.exports = {
  mode: {
    tvl: gmxExportsV2({ eventEmitter: '0xd63352120c45378682d705f42a9F085E79E3c888', fromBlock: 25655, })
  }
}
