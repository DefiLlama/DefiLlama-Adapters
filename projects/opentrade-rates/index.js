const XRV1 = '0xbb9360d57f68075e98d022784c12f2fda082316b'

const tvl = async (api) => {
  const [asset, balance] = await Promise.all([
    api.call({ target: XRV1, abi: 'address:asset' }),
    api.call({ target: XRV1, abi: 'uint256:totalAssets' }),
  ])
  
  api.add(asset, balance)
}

module.exports = {
  avax: { tvl }
}