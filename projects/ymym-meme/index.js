const { sumTokens2 } = require('../helper/unwrapLPs')

// YMYM launchpad liquidity is held in single-sided Uniswap V3 positions whose
// NFTs are permanently owned by the protocol LiquidityLocker.
const config = {
  robinhood: {
    locker: '0x624fb911D5c1F9004D9ac21f85Eea163922DDc7f',
    nftManager: '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3',
    whitelistedTokens: ['0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'], // WETH
  },
}

module.exports = {
  doublecounted: true, // Liquidity is already counted in the underlying DEX TVL.
  methodology: 'TVL is the value of WETH in the permanently locked Uniswap V3 LP positions.',
}

Object.keys(config).forEach((chain) => {
  const { locker, nftManager, whitelistedTokens } = config[chain]

  module.exports[chain] = {
    tvl: async (api) => sumTokens2({
      api,
      owners: [locker],
      resolveUniV3: true,
      uniV3WhitelistedTokens: whitelistedTokens,
      uniV3ExtraConfig: { nftAddress: nftManager },
    }),
  }
})
