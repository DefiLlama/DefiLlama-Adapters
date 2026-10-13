const ADDRESSES = require('../helper/coreAssets.json')

// ProYield USDC vault on HyperEVM (chain id 999), deployed 2026-09-25.
// Non-custodial, guarded-beta vault: idle USDC plus USDC allocated to its
// registered yield strategies, all denominated in USDC.
const VAULT = '0x8954a73Bb36D17e4B212137Eb7B2328A1A14D1C1'

async function tvl(api) {
  const totalAssets = await api.call({ abi: 'uint256:totalAssets', target: VAULT })
  api.add(ADDRESSES.hyperliquid.USDC, totalAssets)
}

module.exports = {
  methodology:
    'TVL is the ProYield vault\'s totalAssets() on HyperEVM (chain id 999), denominated in USDC: idle USDC held by the vault plus USDC the vault has allocated to its registered yield strategies. The vault is a capped guarded beta, so TVL is deliberately small while deposit caps are low. No borrowed or double-counted balances; the protocol has no token counted in TVL.',
  hyperliquid: {
    tvl,
  },
}
