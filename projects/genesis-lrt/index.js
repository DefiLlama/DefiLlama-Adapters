const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  if (api.timestamp > 1715181240) return {}
  const staked = await api.call({ abi: 'uint256:totalAssets', target: '0xf073bAC22DAb7FaF4a3Dd6c6189a70D54110525C' })
  api.add(ADDRESSES.null, staked)
}

module.exports = {
  hallmarks: [
    [1714953600,"Genesis Merges with InceptionLRT"]
  ],
  doublecounted: true,
  ethereum: { tvl, },
}