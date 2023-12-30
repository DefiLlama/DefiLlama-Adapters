const config = {
  arbitrum: {
    collateralContract: '0xaf8ced28fce00abd30463d55da81156aa5aeeec2',
    products: [
      '0xea281a4c70ee2ef5ce3ed70436c81c0863a3a75a', // TCAP LP
      '0x4243b34374cfb0a12f184b92f52035d03d4f7056', // TCAP Short
      '0x1cd33f4e6edeee8263aa07924c2760cf2ec8aad0', // TCAP Long
    ]
  }
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { collateralContract, products, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const token = await api.call({  abi: 'address:token', target: collateralContract })
      const bals = await api.multiCall({  abi: 'function collateral(address) view returns (uint256)', calls: products, target: collateralContract })
      bals.forEach(i => api.add(token, i))
    }
  }
})
