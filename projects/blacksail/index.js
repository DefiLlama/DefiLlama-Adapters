const { getConfig } = require('../helper/cache');
const { get } = require('../helper/http')
const { getEnv } = require('../helper/env')
const { sumUnknownTokens } = require('../helper/unknownTokens')

async function fetcher() {
  const { data: { yield }} = await get('https://api.blacksail.finance/stats', {
    headers: {
      'x-api-key': getEnv('BLACKSAIL_API_KEY'),
      'Content-Type': 'application/json'
    }
  });
  return Object.values(yield).map((i) => i.strat_address).filter(i => i)
}

async function tvl(api) {
  let strats = await getConfig('blacksail/strats', undefined, { fetcher })
  strats = (await api.multiCall({ abi: 'address:staking_token', calls: strats, permitFailure: true  })).map((v, i) => v ? strats[i] : null).filter(i => i)
  const bals = (await api.multiCall({ abi: 'uint256:balanceOf', calls: strats}))
  const tokens = await api.multiCall({ abi: 'address:staking_token', calls: strats })
  const symbols = await api.multiCall({ abi: 'string:symbol', calls: tokens })
  const ichiVaults = []
  const ichiBals = []
  tokens.forEach((token, i) => {
    if (symbols[i] === 'ICHI_Vault_LP') {
      ichiVaults.push(token)
      ichiBals.push(bals[i])
    } else
      api.add(token, bals[i])
  })

  // resolve ichi vaults
  const iSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: ichiVaults })
  const iToken0s = await api.multiCall({ abi: 'address:token0', calls: ichiVaults })
  const iToken1s = await api.multiCall({ abi: 'address:token1', calls: ichiVaults })
  const iTokenBals = await api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 bal1, uint256 bal2)', calls: ichiVaults })

  iSupplies.map((_, i) => {
    const token0 = iToken0s[i]
    const token1 = iToken1s[i]
    const ratio = ichiBals[i] / iSupplies[i]
    api.add(token0, iTokenBals[i].bal1 * ratio)
    api.add(token1, iTokenBals[i].bal2 * ratio)
  })

  return sumUnknownTokens({ api, useDefaultCoreAssets: true, lps: tokens.filter((_, i) => symbols[i].startsWith('v-')), resolveLP: true, allLps: true, })
}

module.exports = {
  sonic: {
    tvl,
  }
}