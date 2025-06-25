const tokens = [
  '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', // USR
  '0x4956b52aE2fF65D74CA2d61207523288e4528f96'  // RLP
]

module.exports = {
  ethereum: { tvl: async (api) =>  api.add(tokens, await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' })) }
}