const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const poolsUrl = "https://pc.leechprotocol.com/pool-data/lama";

async function getPoolData(api) {
  return getConfig('leech-protocol/' + api.chain, `${poolsUrl}/${api.chainId}`)
}

async function tvl(api) {
  const { items: pools } = await getPoolData(api);
  const chain = api.chain
  const wantPools = []
  const lpPools = []
  const sslpPools = []
  const biswapPools = []
  const thenaPools = []
  const veloPools = []
  pools.forEach(({ address, name }) => {
    switch (chain) {
      case 'avax':
        if (name === 'strategy-yak') {
          wantPools.push(address)
        }
        break;
      case 'optimism':
        if (name === 'sushi-opt') {
          sslpPools.push(address)
        } else if (name === 'velo-opt') {
          veloPools.push(address)
        }

        break;
      case 'bsc':
        if (name === 'strategy-thena') {
          thenaPools.push(address)
        } else if (name === 'strategy-biswap-farm') {
          biswapPools.push(address)
        } else if (name === 'strategy-venus-supl') {
          wantPools.push(address)
        }
        break;
    }
  })

  if (wantPools.length > 0) {
    const wTokens = await api.multiCall({ abi: 'address:want', calls: wantPools })
    const wBals = await api.multiCall({ abi: 'uint256:balanceOfUnderlying', calls: wantPools })
    api.addTokens(wTokens, wBals)
  }

  if (lpPools.length > 0) {
    const wTokens = await api.multiCall({ abi: 'address:lp', calls: lpPools })
    const wBals = await api.multiCall({ abi: 'uint256:balance', calls: lpPools })
    api.addTokens(wTokens, wBals)
    await sumTokens2({ api, resolveLP: true, })
  }

  if (thenaPools.length > 0) {
    const sslpTokens = await api.multiCall({ abi: 'address:want', calls: thenaPools })
    const sslpBals = await api.multiCall({ abi: 'uint256:balance', calls: thenaPools })
    const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: sslpTokens })
    const token0s = await api.multiCall({ abi: 'address:token0', calls: sslpTokens })
    const token1s = await api.multiCall({ abi: 'address:token1', calls: sslpTokens })
    const reserves = await api.multiCall({ abi: 'function getTotalAmounts() public view returns (uint256, uint256)', calls: sslpTokens })
    reserves.forEach(([token0Bal, token1Bal], i) => {
      const ratio = sslpBals[i] / supplies[i]
      api.add(token0s[i], token0Bal * ratio)
      api.add(token1s[i], token1Bal * ratio)
    })
  }

  if (sslpPools.length > 0) {
    const sslpTokens = await api.multiCall({ abi: 'address:lp', calls: sslpPools })
    const sslpBals = await api.multiCall({ abi: 'uint256:balance', calls: sslpPools })
    const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: sslpTokens })
    const token0s = await api.multiCall({ abi: 'address:token0', calls: sslpTokens })
    const token1s = await api.multiCall({ abi: 'address:token1', calls: sslpTokens })
    const reserves = await api.multiCall({ abi: 'function getReserves() public view returns (uint256, uint256)', calls: sslpTokens })
    reserves.forEach(([token0Bal, token1Bal], i) => {
      const ratio = sslpBals[i] / supplies[i]
      api.add(token0s[i], token0Bal * ratio)
      api.add(token1s[i], token1Bal * ratio)
    })
  }

  if (veloPools.length > 0) {
    const sslpTokens = await api.multiCall({ abi: 'address:LP', calls: veloPools })
    const sslpBals = await api.multiCall({ abi: 'uint256:balance', calls: veloPools })
    const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: sslpTokens })
    const token0s = await api.multiCall({ abi: 'address:token0', calls: sslpTokens })
    const token1s = await api.multiCall({ abi: 'address:token1', calls: sslpTokens })
    const reserves = await api.multiCall({ abi: 'function getReserves() public view returns (uint256, uint256)', calls: sslpTokens })
    reserves.forEach(([token0Bal, token1Bal], i) => {
      const ratio = sslpBals[i] / supplies[i]
      api.add(token0s[i], token0Bal * ratio)
      api.add(token1s[i], token1Bal * ratio)
    })
  }

  if (biswapPools.length > 0) {
    const wTokens = await api.multiCall({ abi: 'address:want', calls: biswapPools })
    const wBals = await api.multiCall({ abi: 'uint256:balance', calls: biswapPools })
    api.addTokens(wTokens, wBals)
    await sumTokens2({ api, resolveLP: true, })
  }

  return api.getBalances()
}

module.exports = {
  bsc: { tvl },
  avax: { tvl },
  optimism: { tvl },
};