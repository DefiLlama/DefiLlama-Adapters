const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

const tokens = [
  '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', // USR
  '0x4956b52aE2fF65D74CA2d61207523288e4528f96'  // RLP
]

module.exports = {
  ethereum: {
    misrepresentedTokens: true,
    tvl: async (api) => { 
      if (api.timestamp > 1774137600) {
        api.add(ADDRESSES.ethereum.USDC, (await api.call({ target: tokens[0], abi: 'erc20:totalSupply' })) / 10 **12)
        api.add(ADDRESSES.ethereum.USDC, -8e13)
        api.add(tokens[1], await api.call({ target: tokens[1], abi: 'erc20:totalSupply' }))
      } else {
        api.add(tokens, await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' }))
      }
    },
    staking: staking('0xFE4BCE4b3949c35fB17691D8b03c3caDBE2E5E23', '0x259338656198eC7A76c729514D3CB45Dfbf768A1'),
  }
}