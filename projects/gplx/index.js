const { gmxExports } = require('../helper/gmx')

module.exports = {
  hallmarks: [
    [1687320000, "Token supply compromise"]
  ],
  pulse:{
    tvl: gmxExports({ vault: '0xC2311efFE60b0dC2491148Ff1bd46F08D64ADC98', })
  }
};