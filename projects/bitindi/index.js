const { staking } = require('../helper/staking')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: staking('0xf559BF9c0563Ed5322E7F493C02ea2275d68A367', '0x77fc65deda64f0cca9e3aea7b9d8521f4151882e', 'bsc'),
  },
  bitindi: {
    staking: async (_, _b, { bitindi: block }) => sumTokens2({
      chain: 'bitindi',
      block,
      owner: '0x7E9dA0832BDB880a2663203c212d933f4c3668C6',
      tokens: [nullAddress],
    })
  }
};
