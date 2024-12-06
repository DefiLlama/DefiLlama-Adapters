const XTBT = {
  ethereum: '0x0f8cbdc544dc1d4bd1bdafe0039be07b825af82a',
  avax: '0xad6605f4987031fd2d6d6816be53eb7c5b764bf7'
}

const tvl = async (api, address) => {
  const [asset, balance] = await Promise.all([
    api.call({ target: address, abi: 'address:liquidityAssetAddr' }),
    api.call({ target: address, abi: 'uint256:totalAssets' })
  ])

  api.add(asset, balance)
}

Object.entries(XTBT).forEach(([chain, address]) => {
  module.exports[chain] = { tvl: async (api) => tvl(api, address) }
})
