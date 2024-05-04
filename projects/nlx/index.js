const { nlxExports } = require('../helper/nlx')


module.exports = {
  core: {
    tvl: nlxExports({ eventEmitter: '0x29792F84224c77e2c672213c4d942fE280D596ef', fromBlock: 13558258, }),
  },
};
