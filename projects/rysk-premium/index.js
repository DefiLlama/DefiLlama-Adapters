const marginPools = [
'0x2f74fb346336b11e3b61A96F2581CE9Bd7431d42', // margin pool hyperliquid
]
const vaultRegistryHyperliquid = '0x425ffAB71CEFc7aB96CBFbb75282e731234C1885'

async function tvlHyperliquid(api) {
  const vaults = await api.call({ abi: 'function getAllVaults() view returns (address[])', target: vaultRegistryHyperliquid })
  const collaterals = (await api.multiCall({ abi: 'function collateralAsset() view returns (address)', calls: vaults })).map(c => c.toLowerCase())
  const uniqueCollaterals = [...new Set(collaterals)]

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
    tvl: tvlHyperliquid,
  }
};