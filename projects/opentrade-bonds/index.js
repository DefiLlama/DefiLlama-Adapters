const XEVT = '0x3ee320c9f73a84d1717557af00695a34b26d1f1d'

const tvl = async (api) => {
  const [asset, balance] = await Promise.all([
    api.call({ target: XEVT, abi: 'address:liquidityAssetAddr' }),
    api.call({ target: XEVT, abi: 'uint256:totalAssets' })
  ])

  api.add(asset, balance)
}

module.exports = {
  ethereum: { tvl }
}