const config = {
  ethereum: {
    vaults: [
      '0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc',
      '0x84631c0d0081FDe56DeB72F6DE77abBbF6A9f93a',
      '0x5fD13359Ba15A84B76f7F87568309040176167cd',
      '0x7a4EffD87C2f3C55CA251080b1343b605f327E3a'
    ],
  },
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { vaults, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const baseTvl = await api.multiCall({ abi: 'function underlyingTvl() public view returns (address[] tokens, uint256[] values)', calls: vaults })
      baseTvl.forEach(({ tokens, values}) => {
        api.add(tokens, values)
      })
    }
  }
})