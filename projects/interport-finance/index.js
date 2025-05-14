const { staking } = require('../helper/staking');

module.exports = {
  ethereum: {
    staking: staking('0x5DC6796Adc2420BD0f48e05f70f34B30F2AaD313', '0x2b1D36f5B61AdDAf7DA7ebbd11B35FD8cfb0DE31'),
    pool2: staking('0x646De66c9A08abF0976869DE259E4B12D06F66ac', '0x4db2C7dd361379134140ffb9D85248e8498008E4'),
    tvl: async () => ({})
  }
}
