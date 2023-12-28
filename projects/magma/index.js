const { getLiquityTvl } = require('../helper/liquity')
// const { staking } = require('../helper/staking')

module.exports = {
  iotex: {
    tvl: getLiquityTvl('0xAeB0B38040aDdc4a2b520919f13944D9bC944435'),
    // staking: staking('0x109e342FE7132585abFa785887E2c05c85Fbcf71', '0x20143c45c2ce7984799079f256d8a68a918eeee6'), // disabled as backing of WEN is already counted towards tvl
  },
};
