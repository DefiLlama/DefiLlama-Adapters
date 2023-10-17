const { sumTokens } = require('../helper/chain/radixdlt');
const { getConfig } = require('../helper/cache')
module.exports = {
  radixdlt: {
    tvl: async (_, _1, _2, { api }) => {
      const { shapeliquidity } = await getConfig('caviarnine', 'https://api-core.caviarnine.com/v1.0/shapeliquidity/get_components')
      const owners = shapeliquidity.map(i => i.component_address)
      return sumTokens({ owners, api, })
    },
  },
  timetravel: false
}
