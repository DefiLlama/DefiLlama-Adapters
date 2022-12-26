const { aQuery } = require('../helper/chain/aptos')

module.exports = {
  timetravel: false,
  aptos: {
    tvl: async () => {
      const { data: { total_aptos } } = await aQuery('/v1/accounts/0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5/resource/0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5::ditto_staking::DittoPool')
      return {
        aptos: total_aptos/1e8
      }
    }
  }
}