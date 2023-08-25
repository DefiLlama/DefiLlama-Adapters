const { gmxExports } = require('../helper/gmx')

module.exports = {
  hallmarks: [
    [1687320000, "Token supply compromise"]
  ],
  pulse:{
    tvl: gmxExports({ vault: '0x4a305E6F8724Cb5F0106C8CdC90e9C6CA6429083', })
  }
};