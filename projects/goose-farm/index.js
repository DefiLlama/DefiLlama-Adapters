const chainList =  [
  {symbol: 'bsc', address: '0x0874f961178879cdbde3500544c49f864f232899', decimals: 18,},
  {symbol: 'ethereum', address: '0xe8a01d8dac4af19ec7a22cf87f3d141ce6e7e9fb', decimals: 6},
  {symbol: 'arbitrum', address: '0x0874F961178879cDbDe3500544C49F864F232899', decimals: 6},
  {symbol: 'op_bnb', address: '0x857aB0b4F236F7DD7E5AC5F96C0bbEbF230c2D3B', decimals: 18},
]

const getTvl = async (api, chain) => {
  const lpToken= await api.call({  abi: 'address:lpToken', target: chain.address})
  const token= await api.call({  abi: 'address:token', target: chain.address})
  const supply= await api.call({  abi: 'uint256:totalSupply', target: lpToken})
  const price= await api.call({  abi: 'uint256:price', target: lpToken})
  api.addTokens(token, supply * price/Math.pow(10, chain.decimals));
}

const tvlFunctions = chainList.reduce((acc, chain) => {
  acc[chain.symbol] = {
    tvl: async (api) => getTvl(api, chain)
  }
  return acc;
}, {});

module.exports = {
  ...tvlFunctions,
};