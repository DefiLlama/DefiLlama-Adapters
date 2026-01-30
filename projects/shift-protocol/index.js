const config = {
  base: [
    "0xaf69Bf9ea9E0166498c0502aF5B5945980Ed1E0E",
    "0x4cE3ec1b7B4FFb33A0B70c64a0560A3F341AA2E1",
  ],
};

module.exports = {
  methodology:
    'TVL is calculated by summing total supply of shares distributed to depositors and multiplied by their share price (comprehensive of profit and loss). Aggregated across configured contracts.',
};

Object.keys(config).forEach(chain => {
  const tokens = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const supply = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens })
      api.add(tokens, supply)
    }
  }
})
