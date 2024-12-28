const { staking } = require('../helper/staking')

module.exports = {
  celo: {
    tvl: () => 0,
    staking: staking('0x588069878442856b683ab39f410ed96b72fb542a', '0xbDd31EFfb9E9f7509fEaAc5B4091b31645A47e4b', "celo", undefined, undefined),
  },
  kava: {    
    staking: staking('0x067543c3D97753dDA22A2cF6a806f47BD6A17B6A', '0xbd10f04b8b5027761fcaad42421ad5d0787211ee', "kava",undefined, undefined),
  },
};

