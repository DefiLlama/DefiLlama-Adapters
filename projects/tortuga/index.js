const ADDRESSES = require('../helper/coreAssets.json')
const { aQuery } = require('../helper/chain/aptos')

module.exports = {
  timetravel: false,
  aptos: {
    tvl: async () => {
      const { data: { supply } } = await aQuery('/v1/accounts/0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114/resource/0x1::coin::CoinInfo%3C0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114::staked_aptos_coin::StakedAptosCoin%3E')
      return {
        aptos: supply.vec[0].integer.vec[0].value/1e8
      }
    }
  }
}