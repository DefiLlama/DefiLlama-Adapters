const { gmxExportsV2 } = require('../helper/gmx')

module.exports = {
  core: {
    //use gmxExportsV2 as NLX is a fork of GMXV2
    tvl: gmxExportsV2({ eventEmitter: '0x29792F84224c77e2c672213c4d942fE280D596ef', fromBlock: 13558258, }),
  },
}