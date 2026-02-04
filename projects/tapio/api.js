const { getAPI } = require('../helper/acala/api')

module.exports = {
  acala: {
    tvl: async () => {
      const chain = 'acala'
      const api = await getAPI(chain)
      const account = '23M5ttkp2zdM8qa6LFak4BySWZDsAVByjepAfr7kt929S1U9'
      return {
        polkadot: (await balanceOf(api, account, { Token: 'DOT'})) / 1e10,
        'liquid-staking-dot': (await balanceOf(api, account,{ Token:  'LDOT'})) / 1e10,
      }
    }
  },
};

async function balanceOf(api, account, token) {
  const tokenRes = await api.query.tokens.accounts(account, token)
  return +tokenRes.toHuman().free.replace(/,/g, '')
}
