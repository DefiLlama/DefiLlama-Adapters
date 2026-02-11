const { gmxExports } = require('../helper/gmx')

module.exports = {
  hallmarks: [
    ['2023-06-21', "Token supply compromise"],
    ['2023-08-24', "Protocol relauch"]
  ],
  pulse:{
    tvl: gmxExports({ vault: '0x4a305E6F8724Cb5F0106C8CdC90e9C6CA6429083', })
  }
};