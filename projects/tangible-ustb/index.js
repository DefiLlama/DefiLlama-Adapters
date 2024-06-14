const USTB = '0x83fedbc0b85c6e29b589aa6bdefb1cc581935ecd'

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const supply = await api.call({ abi: 'erc20:totalSupply', target: USTB })
      api.add(USTB, supply)
    },
  },
}