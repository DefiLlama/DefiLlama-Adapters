const { aQuery } = require('../helper/chain/aptos')

module.exports = {
  aptos: {
    tvl: async () => {
      const { data: { supply } } = await aQuery('/v1/accounts/0x4e1854f6d332c9525e258fb6e66f84b6af8aba687bbcb832a24768c4e175feec/resource/0x1::coin::CoinInfo%3C0x4e1854f6d332c9525e258fb6e66f84b6af8aba687bbcb832a24768c4e175feec::abtc::ABTC%3E')
      return supply.vec[0].integer.vec[0].value/1e10
    }
  }
}
