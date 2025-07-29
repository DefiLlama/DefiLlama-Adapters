const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const data = await getConfig('plunderswap', 'https://static.plunderswap.com/PlunderswapPoolPrices.json')
  const v3Pairs = data.filter(pair => pair.version === 'V3').map(pair => pair.address)
  const token0s = await api.multiCall({ abi: 'address:token0', calls: v3Pairs })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: v3Pairs })
  return sumTokens2({ api, tokensAndOwners2: [token0s.concat(token1s), v3Pairs.concat(v3Pairs)] })
}

module.exports = {
  zilliqa: { tvl }
}