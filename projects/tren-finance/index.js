const SSL = ['0xDC4a311f0D852934d9b51C0eAc7c7e13EA1DF11b', '0xDFF4a68044eb68c60354810E9316B2B6DB88B3eb']

async function tvl(api) {
  const stables = await api.multiCall({ abi: 'address:stable', calls: SSL })
  await api.sumTokens({ tokensAndOwners2: [stables, SSL] })
  const hyperPools = ['0xDC4a311f0D852934d9b51C0eAc7c7e13EA1DF11b']

  const vaults = await api.multiCall({ abi: 'address:vault', calls: hyperPools })
  const vaultBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: vaults.map((v, i) => ({ target: v, params: hyperPools[i] })) })
  const vaultSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: vaults })
  const vToken0s = await api.multiCall({ abi: 'address:token0', calls: vaults })
  const vToken1s = await api.multiCall({ abi: 'address:token1', calls: vaults })
  const vTokenAmounts = await api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 total0, uint256 total1)', calls: vaults })

  vaults.forEach((_vault, i) => {
    const token0 = vToken0s[i]
    const token1 = vToken1s[i]
    const { total0, total1, } = vTokenAmounts[i]
    const ratio = vaultBalances[i] / vaultSupplies[i]
    api.add(token0, total0 * ratio)
    api.add(token1, total1 * ratio)
  })

  const curvePoolVaults = ['0xDFF4a68044eb68c60354810E9316B2B6DB88B3eb']
  const curvePools = await api.multiCall({ abi: 'address:curvePool', calls: curvePoolVaults })
  const cBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: curvePools.map((v, i) => ({ target: v, params: curvePoolVaults[i] })) })
  const cSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: curvePools })


  for (const cPool of curvePools) {
    const i = curvePools.indexOf(cPool)
    const cTokens = await api.fetchList({ lengthAbi: 'N_COINS', itemAbi: 'coins', target: cPool })
    const ratio = cBalances[i] / cSupplies[i]
    const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: cTokens.map((v) => ({ target: v, params: cPool })) })
    for (let j=0; j<cTokens.length; j++) 
      api.add(cTokens[j], bals[j] * ratio)
  }

  api.removeTokenBalance('0xd4fe6e1e37dfcf35e9eeb54d4cca149d1c10239f')
}

module.exports = {
  arbitrum: { tvl },
};
