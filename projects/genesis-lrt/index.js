const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const staked = await api.call({ abi: 'uint256:totalAssets', target: '0xf073bAC22DAb7FaF4a3Dd6c6189a70D54110525C' })
  api.add(ADDRESSES.null, staked)
}

module.exports = {
  hallmarks: [
    [1714953600,"Genesis Merges with InceptionLRT"],
    [1734530420,"https://x.com/Amphor_io/status/1869416042323120254"]
  ],
  doublecounted: true,
  ethereum: { tvl: tvl, }
}
