// Agua — aguaUSDCgc ("Agua USDC Global Carry"), an ERC-4626 USDC vault.
// TVL = the USDC deposited by users into the vault (totalAssets / NAV).
const vaults = {
  ethereum: ['0xa98b4a70e17e55045cde4972b95bc2e8cec22a0f'],
}

module.exports = {
  methodology:
    'Counts the USDC deposited into the aguaUSDCgc ERC-4626 vault, read as the vault\'s totalAssets() (net asset value) on each chain.',
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
