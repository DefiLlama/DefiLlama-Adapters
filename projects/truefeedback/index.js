const { staking } = require('../helper/staking')

module.exports = {
  celo: {
    tvl: () => 0,
    staking: staking('0x588069878442856b683ab39f410ed96b72fb542a', '0xbdd31effb9e9f7509feaac5b4091b31645a47e4b', undefined, 'truefeedbackchain', 18),
  },
  kava: {
    staking: staking('0x067543c3D97753dDA22A2cF6a806f47BD6A17B6A', '0xbd10F04B8b5027761fCAAd42421aD5d0787211Ee', undefined, 'truefeedbackchain', 18),
  },
};

