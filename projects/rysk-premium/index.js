const config = {
  hyperliquid: {
    vaultRegistry: '0x425ffAB71CEFc7aB96CBFbb75282e731234C1885',
    marginPools: [
      '0x2f74fb346336b11e3b61A96F2581CE9Bd7431d42', // margin pool hyperliquid
    ],
  },
  ethereum: {
    vaultRegistry: '0x12a86ae14992c5a5e8671d30cfd60289f9d0afbe',
    marginPools: [
      '0xeBBF94722F01533D0C2672DcF3b1643672dDB07f', // margin pool ethereum
    ],
  },
}

async function tvl(api) {
  const { vaultRegistry, marginPools } = config[api.chain]
  const vaults = await api.call({ abi: 'function getAllVaults() view returns (address[])', target: vaultRegistry })
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
  ...Object.fromEntries(Object.keys(config).map(chain => [chain, { tvl }])),
};
