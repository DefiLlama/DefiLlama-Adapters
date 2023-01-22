const { getStakedTron } = require('../helper/chain/tron');
const { staking } = require('../helper/staking')
const { sumTokensExport } = require('../helper/sumTokens');
const { nullAddress } = require('../helper/unwrapLPs');

module.exports = {
  klaytn: {
    tvl: sumTokensExport({
      chain: 'klaytn',
      owners: [
        '0xDa664b81C13b050F9b0435D0B712218Aa8BB1609',
        '0x0D3ACA076712DE598DF856cEcEF76daD38F0A75b',
      ],
      tokens: [nullAddress],
    }),
    staking: staking('0x306ee01a6ba3b4a8e993fa2c1adc7ea24462000c', '0xe06597d02a2c3aa7a9708de2cfa587b128bd3815', 'klaytn'),
  },
  tron: {
    tvl: async () => {
      return {
        tron: await getStakedTron('TTjacDH5PL8hpWirqU7HQQNZDyF723PuCg')
      }
    },
  },
  timetravel: false,
}
