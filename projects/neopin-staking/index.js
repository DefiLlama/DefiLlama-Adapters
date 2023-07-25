const ADDRESSES = require('../helper/coreAssets.json')
const { getStakedTron } = require('../helper/chain/tron');
const { staking } = require('../helper/staking')
const { sumTokensExport } = require('../helper/sumTokens');
const { nullAddress } = require('../helper/unwrapLPs');

module.exports = {
  klaytn: {
    tvl: sumTokensExport({
      owners: [
        '0xDa664b81C13b050F9b0435D0B712218Aa8BB1609',
        '0x0D3ACA076712DE598DF856cEcEF76daD38F0A75b',
        '0xf9d92BAd7b1410dfFB0a204B7aa418C9fd5A898F',
        '0xf20816C9bdcb25da3ba79b206e9b7107ae02ae10'
      ],
      tokens: [nullAddress],
    }),
    staking: staking('0x306ee01a6ba3b4a8e993fa2c1adc7ea24462000c', ADDRESSES.klaytn.NPT, 'klaytn'),
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
