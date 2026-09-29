const { queryV1Beta1V2 } = require('../helper/chain/cosmos.js')

module.exports = {
  timetravel: false,
  embr: {
    tvl: async () => {
      const balances = {}
      let supply = await queryV1Beta1V2({ chain: 'embr', url: 'bank/v1beta1/supply', limit: 50 })
      
      for (const { denom, amount } of supply) {
        if (denom.startsWith('evm/')) {
          balances[`embr:${denom.replace('evm/', '0x')}`] = amount
        }
      }
      return balances
    },
  },
}
