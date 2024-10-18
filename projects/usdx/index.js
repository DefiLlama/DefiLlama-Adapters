const usdxAddress = "0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef";
const chains = ["ethereum", "bsc", "arbitrum"];

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const supply = await api.call({  abi: 'erc20:totalSupply', target: usdxAddress})
      api.addCGToken('usdx-money-usdx', supply/1e18)
    },
  }
})