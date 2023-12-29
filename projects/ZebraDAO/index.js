const { compoundExports2 } = require("../helper/compound");
const { staking } = require('../helper/staking')

module.exports = {
  base: compoundExports2({ comptroller: '0xBEA1D596Ae022fae90d84ffaF0907E38a25Ed6E7', cether: '0x4B20dBdd4d5a7A762f788796DF5e0487007C6B36', }),
};

module.exports.base.staking = staking(
  ['0x0b42A3D7290a94DF04cf4193f62856950A5F5f89', '0x5346fa63509Ed9dEeF2795eD62f5cC84a5F2Ab00'],
  '0xF0ce1d83b5FC9c67F157d8B97fD09E2cF8AF899E',
)
