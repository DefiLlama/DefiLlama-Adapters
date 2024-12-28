const { staking } = require('../helper/staking')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: staking('0xd578bf8cc81a89619681c5969d99ea18a609c0c3', '0x8FFf93E810a2eDaaFc326eDEE51071DA9d398E83'),
  },
  bitgert: {
    staking: async (api) => sumTokens2({
      api,
      owner: '0x8Ed91b2f3d9f6a5Ee426B4705F981090a7403795',
      tokens: [nullAddress],
    })
  }
};
