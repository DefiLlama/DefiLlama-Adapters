const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens, sumTokensExport } = require('../helper/sumTokens')

const API_URL = 'https://api-v2.ashswap.io/graphql';

const TVLQuery = `query ashBaseStateQuery {
  pools {
    address
  }
  poolsV2 {
    address
  }
}`

async function tvl() {
  const data = await cachedGraphQuery('ashswap', API_URL, TVLQuery)
  const owners = Object.values(data).flat().map(i => i.address)
  return sumTokens({ owners, chain: 'elrond'})
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    staking: sumTokensExport({ owner: 'erd1qqqqqqqqqqqqqpgq58elfqng8edp0z83pywy3825vzhawfqp4fvsaldek8'}),
  },
}