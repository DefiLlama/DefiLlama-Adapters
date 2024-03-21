const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const staked = await api.call({  abi: 'uint256:totalAssets', target: '0xf073bAC22DAb7FaF4a3Dd6c6189a70D54110525C'})
  api.add(ADDRESSES.null, staked)
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl, },
}