// Agua — an onchain capital allocator. Deposits into the aguaUSDCgc
// ("Agua USDC Global Carry") ERC-4626 vault are allocated into leveraged
// looping strategies across external lending markets (Aave, Morpho, Euler,
// Kamino, …). TVL = the USDC deposited into the vault (totalAssets / NAV).
const vaults = {
  ethereum: ['0xa98b4a70e17e55045cde4972b95bc2e8cec22a0f'],
}

module.exports = {
  // Deposits are allocated into external lending markets that DefiLlama
  // already tracks, so this TVL overlaps with those protocols.
  doublecounted: true,
  methodology:
    'TVL is the sum of assets deposited into Agua\'s ERC-4626 vault(s), read from each vault\'s totalAssets() (net asset value) and denominated in the underlying asset (USDC).',
}

Object.keys(vaults).forEach((chain) => {
  module.exports[chain] = {
    tvl: (api) =>
      api.erc4626Sum({
        calls: vaults[chain],
        tokenAbi: 'address:asset',
        balanceAbi: 'uint256:totalAssets',
      }),
  }
})
