const { getTokensAccount } = require('../helper/chain/substrate')
const { token } = require('../helper/acala/currency')

const chain = 'acala'
const account = '23M5ttkp2zdM8qa6LFak4BySWZDsAVByjepAfr7kt929S1U9'

const balanceOf = async (owner, currencyId) => Number((await getTokensAccount(chain, owner, currencyId)).free)

async function tvl() {
  return {
    polkadot: (await balanceOf(account, token('DOT'))) / 1e10,
    'liquid-staking-dot': (await balanceOf(account, token('LDOT'))) / 1e10,
  }
}

module.exports = {
  timetravel: false,
  acala: { tvl },
}
