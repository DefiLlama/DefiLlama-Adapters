const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const vault = '0xC6dC7749781F7Ba1e9424704B2904f2F94D3eb63'
  const dlp = await api.call({  abi: 'address:dlp', target: vault})
  const masterchef = await api.call({  abi: 'address:mfd', target: vault})
  const { total }= await api.call({ abi:"function lockedBalances(address user) view returns (uint256 total, uint256 unlockable, uint256 locked, uint256 lockedMultiplier, tuple(uint256 amount, uint256 unlockTime, uint256, uint256)[] lockData)", target: masterchef, params: vault })
  api.add(dlp, total)
  return sumTokens2({ owner: vault, tokens: [dlp], api})  
}

module.exports = {
  doublecounted: true,
  arbitrum: {
    tvl,
  },  
}