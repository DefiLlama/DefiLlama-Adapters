
const rwaPools = [
  '0xfe119e9C24ab79F1bDd5dd884B86Ceea2eE75D92', //   Cash Management
  '0xe9d33286f0E37f517B1204aA6dA085564414996d', // AQRU
]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:asset', calls: rwaPools })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: rwaPools })
  api.addTokens(tokens, bals)
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl, }
}