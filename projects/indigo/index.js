const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  cardano: {
    tvl: async () => {
      const cdpData = await get('https://analytics.indigoprotocol.io/api/cdps')
      const cdpTvl = cdpData.reduce((a, i) => a + (i.collateralAmount/1e6), 0);
      const stakingManagerData = await get('https://analytics.indigoprotocol.io/api/staking-manager')
      const totalIndyStaked = stakingManagerData.total_stake / 10 ** 6;
      const indyPriceData = await get('https://analytics.indigoprotocol.io/api/indy-price')
      const totalIndyStakedTvl = indyPriceData.ada_price * totalIndyStaked;
      return {
        cardano: cdpTvl + totalIndyStakedTvl
      }
    }
  },
}