const axios = require('axios')

const chains = ['bsc','kcc', 'aurora', 'clv']
const url = 'https://api.killswitch.finance/ksw/tvl'

const tvl = async (api) => {
  const { data } = await axios.get(url)
  return api.addUSDValue(Math.round(data.summary[api.chain]))
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  misrepresentedTokens: true,
}

chains.forEach((chain) => {
  if (chain === 'clv') return module.exports[chain] = { tvl: () => ({}) };
  module.exports[chain] = { tvl }
})

