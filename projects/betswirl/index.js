const { staking } = require('../helper/staking')

module.exports = {
  methodology: "TVL counts BETS tokens deposited on the Staking contracts.",
  start: 1687715559,
  bsc: {
    tvl: () => ({}),
    staking: staking('0xeb5F6571861EAA6de9F827519B48eFe979d4d913', '0x3e0a7C7dB7bB21bDA290A80c9811DE6d47781671'),
  },
  polygon: {
    staking: staking('0xa184468972c71209BC31a5eF39b7321d2A839225', '0x9246a5f10a79a5a939b0c2a75a3ad196aafdb43b'),
  },
  avax: {
    staking: staking('0x31EDcD915e695AdAF782c482b9816613b347AC8c', '0xc763f8570a48c4c00c80b76107cbe744dda67b79'),
  },
  arbitrum: {
    staking: staking('0xD4BFB259D8785228e5D2c19115D5DB342E2eE064', '0xe26ae3d881f3d5def58d795f611753804e7a6b26'),
  },
};
