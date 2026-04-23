const { getConfig } = require('../helper/cache')

async function tvl(api) {
  const chainId = api.chainId
  const config = await getConfig(`travessia-${chainId}`, `https://www.travessiacredit.com/api/vaults?chainId=${chainId}`)
  const vaults = config.map((res) => res.vaultAddress)
  const [supplies, assets] = await Promise.all([
    api.multiCall({ abi: 'erc20:totalSupply', calls: vaults }),
    api.multiCall({ abi: 'address:asset', calls: vaults }),
  ])
  const totalAssets = await api.multiCall({
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    calls: vaults.map((v, i) => ({ target: v, params: [supplies[i]] })),
  })
  vaults.forEach((_, i) => api.add(assets[i], totalAssets[i]))
}

module.exports = {
  methodology: 'TVL is total vault shares converted to underlying via convertToAssets.',
  monad: { tvl },
  ethereum: { tvl },
}
