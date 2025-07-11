const ethereumTokens = [
  '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', // USR
  '0x4956b52aE2fF65D74CA2d61207523288e4528f96'  // RLP
]
const baseTokens=['0x35e5db674d8e93a03d814fa0ada70731efe8a4b9'] // USR

const bscTokens = ['0x2492d0006411af6c8bbb1c8afc1b0197350a79e9']  // USR

module.exports = {
  ethereum: { tvl: async (api) =>  api.add(ethereumTokens, await api.multiCall({ calls: ethereumTokens, abi: 'erc20:totalSupply' })) },
  base: { tvl: async (api) =>  api.add(baseTokens, await api.multiCall({ calls: baseTokens, abi: 'erc20:totalSupply' })) },
  bsc: { tvl: async (api) =>  api.add(bscTokens, await api.multiCall({ calls: bscTokens, abi: 'erc20:totalSupply' })) }
}