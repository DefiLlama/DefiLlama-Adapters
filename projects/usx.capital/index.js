const ADDRESSES = require('../helper/coreAssets.json')
const treasury = '0x9F3d4b0C9E930Ca3957eCD3DEdb7417f8e0e4c35'

async function tvl(api) {
  const assetManagerUSDC = await api.call({ abi: 'uint256:assetManagerUSDC', target: treasury })
  api.add(ADDRESSES.scroll.USDC, assetManagerUSDC)
}

module.exports = {
  scroll: { tvl }
}