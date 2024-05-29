const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const staked = await api.call({ abi: 'uint256:totalAssets', target: '0xf073bAC22DAb7FaF4a3Dd6c6189a70D54110525C' })
  api.add(ADDRESSES.null, staked)
}
async function tvl_mode(api) {
  const staked = await api.call({ abi: 'uint256:totalAssets', target: '0x5A7a183B6B44Dc4EC2E3d2eF43F98C5152b1d76d' })
  api.add(ADDRESSES.null, staked)
}
async function tvl_linea(api) {
  const staked = await api.call({ abi: 'uint256:totalAssets', target: '0x5A7a183B6B44Dc4EC2E3d2eF43F98C5152b1d76d' })
  api.add(ADDRESSES.null, staked)
}
async function tvl_blast(api) {
  const staked = await api.call({ abi: 'uint256:totalAssets', target: '0x5A7a183B6B44Dc4EC2E3d2eF43F98C5152b1d76d' })
  api.add(ADDRESSES.null, staked)
}
async function tvl_bsc(api) {
  const staked = await api.call({ abi: 'uint256:totalAssets', target: '0x5A7a183B6B44Dc4EC2E3d2eF43F98C5152b1d76d' })
  api.add(ADDRESSES.null, staked)
}
async function tvl_arbitrum(api) {
  const staked = await api.call({ abi: 'uint256:totalAssets', target: '0x5A7a183B6B44Dc4EC2E3d2eF43F98C5152b1d76d' })
  api.add(ADDRESSES.null, staked)
}
async function tvl_optimism(api) {
  const staked = await api.call({ abi: 'uint256:totalAssets', target: '0x5A7a183B6B44Dc4EC2E3d2eF43F98C5152b1d76d' })
  api.add(ADDRESSES.null, staked)
}

module.exports = {
  hallmarks: [
    [1714953600,"Genesis Merges with InceptionLRT"]
  ],
  doublecounted: true,
  ethereum: { tvl: tvl, },
  mode: { tvl: tvl_mode, },
  linea: { tvl: tvl_linea, },
  blast: { tvl: tvl_blast, },
  bsc: { tvl: tvl_bsc, },
  arbitrum: { tvl: tvl_arbitrum, },
  optimism: { tvl: tvl_optimism, },
}
