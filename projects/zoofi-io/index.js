async function tvl(api) {
  const zooProtocol = '0xc0fA386aE92f18A783476d09121291A1972C30Dc'
  const assets = await api.call({ abi: 'address[]:assetTokens', target: zooProtocol })
  const vaults = (await api.multiCall({ abi: 'function getVaultAddresses(address) view returns (address[])', calls: assets, target: zooProtocol })).flat()
  const bals = await api.multiCall({ abi: 'uint256:assetBalance', calls: vaults })
  const tokens = await api.multiCall({ abi: 'address:assetToken', calls: vaults })
  api.add(tokens, bals)
}

module.exports = {
  doublecounted: true,
  berachain: { tvl }
}