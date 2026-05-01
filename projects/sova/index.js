module.exports = {
  methodology: 'TVL is calculated as the cbBTC underlying managed by the Sova svBTC ERC-4626 vault on Base, using totalAssets() so deployed strategy capital is included.',
  base: {
    tvl: async (api) => api.erc4626Sum2({ calls: ['0xdFc4047620bd71F3dd781f1048f6890b76281D36'] }),
  },
}
