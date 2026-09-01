const poolAbi = {
  activePools: "function activePools() view returns (address[])",
  collaterals: "function collaterals() view returns (address[])",
  asset: "function asset() view returns (address)",
  borrowed: "function borrowed() view returns (uint256)"
};

const registry = "0xFF11a76cB422642525B751972151841673CB0C57"

const tvl = async (api) => {
  const pools = await api.call({ target: registry, abi: poolAbi.activePools })
  const collateralsTokens = await api.multiCall({ calls: pools, abi: poolAbi.collaterals })

  const taos = pools.flatMap((pool, index) => {
    const collaterals = collateralsTokens[index]
    return collaterals.map((coll) => ([coll, pool]));
  })

  return api.sumTokens({ tokensAndOwners: taos })
}

const borrowed = async (api) => {
  const pools = await api.call({ target: registry, abi: poolAbi.activePools })
  const assets = await api.multiCall({ calls: pools, abi: poolAbi.asset })
  const totalBorrows = await api.multiCall({ calls: pools, abi: poolAbi.borrowed });

  pools.forEach((pool, index) => {
    const asset = assets[index]
    const totalBorrow = totalBorrows[index]
    return api.add(asset, totalBorrow)
  })
}

module.exports = {
  methodology: `TVL is comprised of assets and collateral deposited to the pools on https://app.chedda.finance`,
  base: { tvl, borrowed }
}
