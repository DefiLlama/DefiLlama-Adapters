const axios = require('axios')
const { sumTokens2 } = require('../helper/solana')

const ENDPOINT = 'https://backend.hawksight.co/portfolio/total_yield'

const tvl = async (api) => {
  const { data } = await axios.get(ENDPOINT)
  data.forEach(({ amount }) => {
    api.addUSDValue(amount ?? 0)
  })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Sums the total value locked of all strategies in Hawksight',
  solana: {
    tvl,
    staking: () => sumTokens2({ tokenAccounts: ['2eFeetCpZJprr67F2dToT52BbSkdeqKZT6hmVdVG14eU'] })
  }
}