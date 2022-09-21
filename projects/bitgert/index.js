const { staking } = require('../helper/staking')

module.exports = {
  bsc: {
  tvl: () =>  ({}),
    staking: staking('0xD578BF8Cc81A89619681c5969D99ea18A609C0C3', '0x8FFf93E810a2eDaaFc326eDEE51071DA9d398E83', 'bsc') + 
    staking('0x8Ed91b2f3d9f6a5Ee426B4705F981090a7403795', '0x0000000000000000000000000000000000000000', 'bitgert')
  },
};
