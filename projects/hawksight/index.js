const { fetchURL } = require('../helper/utils')


async function tvl() {
  const res = await fetchURL('https://api.hawksight.co/data/hawksight_tvl')
  return {'usd': res.data}
}

module.exports = {
  timetravel: false,
  methodology: 'Sums the total value locked of all strategies in Hawksight',
  solana: {
    tvl,
  }
}