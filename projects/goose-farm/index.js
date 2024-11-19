module.exports = {
  bsc: {
    tvl: async (api) => {
      const vault = '0x0874f961178879cdbde3500544c49f864f232899'
      const lpToken= await api.call({  abi: 'address:lpToken', target: vault})
      const token= await api.call({  abi: 'address:token', target: vault})
      const supply= await api.call({  abi: 'uint256:totalSupply', target: lpToken})
      const price= await api.call({  abi: 'uint256:price', target: lpToken})
      
      api.addTokens(token, supply * price/1e18);
    }
  }
};