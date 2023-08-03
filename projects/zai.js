const { staking } = require('./helper/staking')
const zaiV2 = '0xe420bce9109365eae3ba6ebf24e5045b72388025';
const zaiLP = '0x675a8fa1cf8a9c3bf2c49ff14fdcaa01b11dd842';

module.exports = {
  ethereum: {
    tvl: () => 0,
    pool2: staking('0x326E906A28Cd7fF56cCe6A84a8043786B8762cDf', zaiLP),
    staking: staking('0xE2612091Ec3dBE6f40BbfD0f30e3b8E4eA896e53', zaiV2),
  }
};