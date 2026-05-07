const ADDRESSES = require('../helper/coreAssets.json')

const VISIONBOARD_VAULT = '0x0a5e236425aca07fd087904F8863CAd554675E06'

async function tvl(api) {
  const [asset, totalAssets] = await Promise.all([
    api.call({ abi: 'address:asset', target: VISIONBOARD_VAULT }),
    api.call({ abi: 'uint256:totalAssets', target: VISIONBOARD_VAULT }),
  ])

  api.add(asset || ADDRESSES.hyperliquid.USDC, totalAssets)
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is calculated from VisionBoard Vault totalAssets() on HyperEVM. Deposits mint VBV vault shares backed by the vault asset, currently USDC.',
  hyperliquid: { tvl },
}
