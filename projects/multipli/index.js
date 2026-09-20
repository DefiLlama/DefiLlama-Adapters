// On-chain ERC4626 vaults only. The official Multipli vault registry lists these Ethereum, BSC, and Avalanche proxies:
// https://docs.multipli.fi/yield-mechanism/yield-mechanics-for-xtokens/multipli-vault-deployed-addresses.md
// The protocol FAQ currently describes Avalanche as the user-facing V2 scope; these additional registry-listed deployments are included for complete on-chain coverage.
const vaults = {
  ethereum: [
    '0x133229E0AdFf22c6F1AD287D199ea09d35E4427B', // xUSDC
    '0x3f453133ea14550B883805672B2871B0Ac295462', // xUSDT
    '0xeA1EF816ddfA86a8E9690423C88C1512c01d1799', // xWBTC
  ],
  bsc: [
    '0x468e0dAbd55772775A9cD4c39fB0d4586B8aEdAe', // xUSDC
    '0xdA0dF997CE0253e979a1E892a0468DBf45A3Dcb8', // xUSDT
    '0x41DbD2BaC7F0dd7A3F0De5329eCb57c9afE14C5C', // xWBTC
  ],
  avax: [
    '0xCF0Eb4ac018C06a16ED5c63484823C7805e7599D', // xUSDC
    '0x468BbabAEf852C134b584382C0fef83F2954Cd5c', // xBTC.b
  ],
}

module.exports = {
  methodology: 'Counts the ERC-4626 totalAssets() value reported by the documented Multipli vaults on Ethereum, BSC, and Avalanche. This may include external strategy or custodial positions reported through each vault’s accounting system.',
  start: '2026-08-01', // Conservative operational boundary; historical BSC results depend on archive RPC availability.
}

Object.entries(vaults).forEach(([chain, calls]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      await api.erc4626Sum({ calls, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' })
    }
  }
})

// Monad is excluded because the public V2 repository identifies its Monad deployment as V1.
// Base, Arbitrum, and Pharos have no corresponding vault in the official V2 deployed-address registry.
