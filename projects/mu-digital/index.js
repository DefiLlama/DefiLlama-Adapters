const tokens = [
  '0x4917a5ec9fcb5e10f47cbb197abe6ab63be81fe8', // AZND (Asian Dollar)
  '0x336d414754967c6682b5a665c7daf6f1409e63e8', // muBOND (mu Bond)
]

module.exports = {
  monad: {
    tvl: async (api) => api.add(tokens, await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' })),
  }
}
