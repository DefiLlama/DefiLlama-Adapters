const { getAPI } = require('../helper/acala/api')
const { forceToCurrencyId } = require("@acala-network/sdk-core");

module.exports = {
  acala: {
    tvl: async () => {
      const chain = 'acala'
      const api = await getAPI(chain)
      const account = '23M5ttkp2zdM8qa6LFak4BySWZDsAVByjepAfr7kt929S1U9'
      return {
        polkadot: (await balanceOf(api, account, 'DOT')) / 1e10,
        'liquid-staking-dot': (await balanceOf(api, account, 'LDOT')) / 1e10,
      }
    }
  },
};

async function balanceOf(api, account, token) {
  const currencyId = await forceToCurrencyId(api, token)
  const tokenRes = await api.query.tokens.accounts(account, currencyId)
  return +tokenRes.toHuman().free.replace(/,/g, '')
}
