const contracts = [
  '0x0bbc2be1333575f00ed9db96f013a31fdb12a5eb', // TBV1
  '0x30c3115dca6370c185d5d06407f29d3ddbc4cfc4', // TBV2
  '0x7bfb97fe849172608895fd4c62237cb42a8607d2', // TBV3
  '0xa65446265517a29f7427abb1279165eb61624dd0'  // TBV4
]

const tvl = async (api) => {
  const [assets, balances] = await Promise.all([
    api.multiCall({ calls: contracts, abi: 'address:asset' }),
    api.multiCall({ calls: contracts, abi: 'uint256:totalAssets' })
  ])

  api.add(assets, balances)
}

module.exports = {
  ethereum : { tvl }
}