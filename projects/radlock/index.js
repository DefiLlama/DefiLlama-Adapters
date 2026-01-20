const { get } = require('../helper/http')

async function tvl(api) {
  const tokensLockedInXrdList = await get('https://api.radlock.io/token/locked?format=list&lpOnly=true')
  return {
    'radix': tokensLockedInXrdList.reduce((acc, token) => acc + +token.xrd, 0)
  }
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}
