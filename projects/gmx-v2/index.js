const { gmxExportsV2 } = require('../helper/gmx')


module.exports = {
  arbitrum: {
    tvl: gmxExportsV2({ eventEmitter: '0xc8ee91a54287db53897056e12d9819156d3822fb', fromBlock: 107737756, }),
  },
  avax:{
    tvl: gmxExportsV2({ eventEmitter: '0xDb17B211c34240B014ab6d61d4A31FA0C0e20c26', fromBlock: 32162455, }),
  },
};
