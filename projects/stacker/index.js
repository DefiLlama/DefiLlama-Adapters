const vaults = [
  '0x067b9FE006E16f52BBf647aB6799f87566480D2c',
  '0x70e51DFc7A9FC391995C2B2f027BC49D4fe01577',
  '0x17E9ed51feD2F190D50f5bd4f1a8C9CbCd36162A',
]

async function tvl(api) {
  const tokens = await api.multiCall({  abi: 'address:underlyingContract', calls: vaults})
  const bals = await api.multiCall({  abi: 'uint256:totalUnderlying', calls: vaults})
  api.add(tokens, bals)
}

module.exports = {
  ethereum: {
    tvl,
  },
}