const usdxAddress = "0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef";
const chains = ["ethereum", "bsc", "arbitrum"];

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      if (api.timestamp * 1000 > new Date('2025-11-14')) return {}  // team has gone silent, website is down, we are treating the project as dead
      const supply = await api.call({  abi: 'erc20:totalSupply', target: usdxAddress})
      api.addCGToken('usdx-money-usdx', supply/1e18)
    },
  }
})

module.exports.deadFrom = '2025-11-14'