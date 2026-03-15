const marginPools = [
'0x2f74fb346336b11e3b61A96F2581CE9Bd7431d42', // margin pool hyperliquid
]
const vaultRegistries = [
  '0x425ffAB71CEFc7aB96CBFbb75282e731234C1885', // vault registry hyperliquid
]

async function tvl(api) {
  const vaultResults = await api.multiCall({ abi: 'function getAllVaults() view returns (address[])', calls: vaultRegistries.map(r => ({ target: r })) })
  const vaults = vaultResults.flat()
  const collaterals = await api.multiCall({ abi: 'function collateralAsset() view returns (address)', calls: vaults })
  const uniqueCollaterals = [...new Set(collaterals.map(c => c.toLowerCase()))]

  const vaultCalls = vaults.map((vault, i) => ({ target: collaterals[i], params: vault }))
  const marginCalls = marginPools.flatMap(pool => uniqueCollaterals.map(token => ({ target: token, params: pool })))

  const calls = [...vaultCalls, ...marginCalls]
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls })
  calls.forEach(({ target }, i) => {
    api.add(target, balances[i])
  })
}


module.exports = {
  methodology: 'balance of all liquidity pools and margin pools deployed',
  hyperliquid: {
    tvl,
  }
};