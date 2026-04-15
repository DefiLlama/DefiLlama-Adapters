const VAULTS = {
  monad: ['0x8D24B48Cb736addb5B7069565F192A052F42Ba61'],
  ethereum: ['0x4C18E2bb9942b12b28e780acF2D9EC2DDA126df9'],
}

async function tvl(api) {
  const vaults = VAULTS[api.chain]
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
