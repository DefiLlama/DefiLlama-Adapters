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
  doublecounted: true,
  methodology:
    'TVL is the Pro Yield vault\'s reported accounting value on HyperEVM (chain id 999), read from the vault\'s totalAssets() and denominated in USDC: idle USDC held by the vault plus USDC the vault has allocated to its registered yield strategies, including any returned amounts still recorded on-chain as in-flight. If USDC returned from a strategy remains recorded on-chain as in-flight without being credited, the reported amount may overstate the vault\'s backing. The vault is a capped guarded beta, so TVL is deliberately small while deposit caps are low. The protocol has no token counted in TVL.',
  hyperliquid: {
    tvl,
  },
}
