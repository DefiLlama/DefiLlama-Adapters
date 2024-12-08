const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const KUSD = '0xE9DF5B4B1134a3AaDf693DB999786699B016239e'
const zUSDT = '0x2274005778063684FBB1BFa96A2B725Dc37D75F9'

async function tvl(api) {
  const data = await getConfig('plunderswap', 'https://static.plunderswap.com/PlunderswapPoolPrices.json')
  const v2Pairs = data.filter(pair => pair.version === 'V2').map(pair => pair.address)
  const token0s = await api.multiCall({ abi: 'address:token0', calls: v2Pairs })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: v2Pairs })

  // Get kUSD balance from all v3 pairs - kUSD is represented as zUSDT (1:1 backed stablecoin)
  const kUsdBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    target: KUSD,
    calls: v2Pairs
  })

  // Sum up balances
  const totalKusd = kUsdBalances.reduce((a, b) => Number(a) + Number(b), 0)
  
  // Add kUSD value to api balances as zUSDT
  api.add(zUSDT, totalKusd)

  return sumTokens2({ 
    api, 
    tokensAndOwners2: [token0s.concat(token1s), v2Pairs.concat(v2Pairs)]
  })
}

module.exports = {
  zilliqa: { tvl }
}