const { staking } = require('../helper/staking')

module.exports = {
  bsc: {
  tvl: () =>  ({}),
    staking: staking('0xD578BF8Cc81A89619681c5969D99ea18A609C0C3', '0x8FFf93E810a2eDaaFc326eDEE51071DA9d398E83', 'bsc')
  },
};
