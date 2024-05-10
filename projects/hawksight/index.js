const { fetchURL } = require('../helper/utils')
const { sumTokens2 } = require('../helper/solana')


async function tvl() {
  const res = await fetchURL('https://api.hawksight.co/data/hawksight_tvl')
  return {'usd': res.data}
}

module.exports = {
  timetravel: false,
  methodology: 'Sums the total value locked of all strategies in Hawksight',
  solana: {
    tvl,
    staking: () => sumTokens2({ tokenAccounts: ['2eFeetCpZJprr67F2dToT52BbSkdeqKZT6hmVdVG14eU']})
  }
}