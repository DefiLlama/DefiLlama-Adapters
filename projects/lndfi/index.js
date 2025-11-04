const CONFIG = {
  sonic: ['0x82c7B4aBB462dE2f7bFDE40c05d1fAa3913DbBB3'],
  hyperliquid: ['0x0F0E6905B0199393b9102be42f28f71c22e30151'],
};

const { aaveV3Export } = require("../helper/aave");

module.exports = aaveV3Export({
  sonic: ['0x82c7B4aBB462dE2f7bFDE40c05d1fAa3913DbBB3'],
  hyperliquid: ['0x0F0E6905B0199393b9102be42f28f71c22e30151'],
})

Object.keys(CONFIG).forEach((chain) => {
  if (module.exports[chain].borrowed) module.exports[chain].borrowed = () => ({})
})

module.exports.deadFrom = '2025-05-10'