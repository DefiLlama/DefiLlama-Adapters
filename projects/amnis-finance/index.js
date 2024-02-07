const ADDRESSES = require('../helper/coreAssets.json')
const { aQuery } = require('../helper/chain/aptos')

module.exports = {
  timetravel: false,
  aptos: {
    tvl: async () => {
      const { data: { supply } } = await aQuery('/v1/accounts/0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a/resource/0x1::coin::CoinInfo%3C0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::amapt_token::AmnisApt%3E')
      return {
        aptos: supply.vec[0].integer.vec[0].value/1e8
      }
    }
  }
}