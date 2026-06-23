const utils = require('../helper/utils');

const url = 'https://api.for.tube/api/v1/bank/public/markets/TVL'

const tvl = async (api) => {
  const { data } = await utils.fetchURL(url)
  return api.addUSDValue(Math.round(data.data))
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl }
}


