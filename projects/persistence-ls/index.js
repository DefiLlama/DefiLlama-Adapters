const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  persistence: {
    tvl: async () => {
      const api = 'https://api.persistence.one/pstake/stkatom/atom_tvu'
      return {
        'cosmos:uatom': (await get(api)).amount.amount
      }
    }
  }
}