const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const abi = {
  convertToAssets: "function convertToAssets(uint256 shares) view returns (uint256 assets)",
}

module.exports = {
  sei: {
    tvl,
  },
}

async function tvl(api) {
  const { pools, stataToUnderlying: preMappedStataToUnderlying } = await getConfig('yei-swap', 'https://swap-api.yei.finance/pools')

  const stataToUnderlying = preMappedStataToUnderlying || buildStataToUnderlyingMap(pools)

  const ownerTokens = []
  for (const pool of pools) {
    if (pool.token0?.address) ownerTokens.push([[pool.token0.address], pool.address])
    if (pool.token1?.address) ownerTokens.push([[pool.token1.address], pool.address])
  }

  const balances = await sumTokens2({ api, ownerTokens, permitFailure: true })

  const calls = Object.entries(balances).map(([key, balance]) => {
    const [, tokenAddress] = key.split(':')
    return {
      target: tokenAddress,
      params: [balance],
    }
  })

  const underlyingAmounts = await api.multiCall({
    abi: abi.convertToAssets,
    calls,
    permitFailure: true,
  })

  underlyingAmounts.forEach((amount, i) => {
    if (amount === null) return
    const stataToken = calls[i].target.toLowerCase()
    const underlyingToken = stataToUnderlying[stataToken]
    
    if (underlyingToken) {
      api.add(underlyingToken, amount)
    } else {
      console.warn(`Missing mapping for stataToken: ${stataToken}`)
    }
  })
}

function buildStataToUnderlyingMap(pools) {
  const map = {};
  for (const pool of pools) {
    for (const tokenKey of ['token0', 'token1']) {
      const token = pool[tokenKey];
      if (token?.address && token.underlying_token?.address) {
        map[token.address.toLowerCase()] = token.underlying_token.address;
      }
    }
  }
  return map;
}