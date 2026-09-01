const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens } = require('../helper/sumTokens')

const API_URL = 'https://api.ashperp.trade/graphql';

const TVLQuery = `query Vault {
    vault {
      _address
      getAssetTokenId
    }
  }`

async function tvl() {
  const data = await cachedGraphQuery('ashperp', API_URL, TVLQuery)
  const owners = Object.values(data).flat().map(i => i._address);
  const token = Object.values(data).flat().map(i => i.getAssetTokenId);
  return sumTokens({ owners, chain: 'elrond', tokens: [token]})
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl
  },
}