const ethereumTokens = [
  '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', // USR
  '0x4956b52aE2fF65D74CA2d61207523288e4528f96'  // RLP
]
const baseTokens = [
  '0x35e5db674d8e93a03d814fa0ada70731efe8a4b9', // USR
  '0xC31389794Ffac23331E0D9F611b7953f90AA5fDC'  // RLP
] 

const bscTokens = [
  '0x2492d0006411af6c8bbb1c8afc1b0197350a79e9', // USR
  '0x35e5db674d8e93a03d814fa0ada70731efe8a4b9'  // RLP
]  
const beraChainTokens = [
  '0x2492D0006411Af6C8bbb1c8afc1B0197350a79e9', // USR
  '0x35E5dB674D8e93a03d814FA0ADa70731efe8a4b9'  //RLP
] 
const hyperEVMTokens = [
  '0x0aD339d66BF4AeD5ce31c64Bc37B3244b6394A77', //USR
  '0x0a3d8466F5dE586FA5F6DE117301e2f90bCC5c48' //RLP
] 
const soneiumTokens = [
  '0xb1b385542b6e80f77b94393ba8342c3af699f15c', //USR
  '0x35533f54740f1f1aa4179e57ba37039dfa16868b' //RLP
] 

module.exports = {
  ethereum: { tvl: async (api) =>  api.add(ethereumTokens, await api.multiCall({ calls: ethereumTokens, abi: 'erc20:totalSupply' })) },
  base: { tvl: async (api) => api.add(baseTokens, await api.multiCall({ calls: baseTokens, abi: 'erc20:totalSupply' })) },
  bsc: { tvl: async (api) => api.add(bscTokens, await api.multiCall({ calls: bscTokens, abi: 'erc20:totalSupply' })) },
  berachain: { tvl: async (api) => api.add(beraChainTokens, await api.multiCall({ calls: beraChainTokens, abi: 'erc20:totalSupply' })) },
  hyperliquid: { tvl: async (api) => api.add(hyperEVMTokens, await api.multiCall({ calls: hyperEVMTokens, abi: 'erc20:totalSupply' })) },
  soneium: { tvl: async (api) => api.add(soneiumTokens, await api.multiCall({ calls: soneiumTokens, abi: 'erc20:totalSupply' })) },
}