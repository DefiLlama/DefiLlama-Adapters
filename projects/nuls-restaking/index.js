const utils = require('../helper/utils');

const url = 'https://assets.nabox.io/api/naistake/tvl'

const tvl = async (api) => {
  const data = await utils.fetchURL(url)  
  return api.addUSDValue(Math.round(data.data))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "A NULS AI Asset Re-Stake Platform.",
  nuls: { tvl },
}
