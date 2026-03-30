const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

const tokens = [
  '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', // USR
  '0x4956b52aE2fF65D74CA2d61207523288e4528f96'  // RLP
]

module.exports = {
  methodology: 'Counts total supply of USR and RLP tokens, subtracting 80M minted in hack.',
  ethereum: {
    misrepresentedTokens: true,
    tvl: async (api) => { 
      if (api.timestamp > 1777106021) throw new Error('Resolv error - has the hack been resolved?')
      if (api.timestamp > 1774137600) {
        api.add(ADDRESSES.ethereum.USDC, (await api.call({ target: tokens[0], abi: 'erc20:totalSupply' })) / 10 **12)
        // Subtract 80M after hack => adjusted to 34M
        // https://etherscan.io/tx/0x41b6b9376d174165cbd54ba576c8f6675ff966f17609a7b80d27d8652db1f18f
        // https://etherscan.io/tx/0xfe37f25efd67d0a4da4afe48509b258df48757b97810b28ce4c649658dc33743
        // https://x.com/ResolvLabs/status/2037110361711870214
        api.add(ADDRESSES.ethereum.USDC, -34e12)
        api.add(tokens[1], await api.call({ target: tokens[1], abi: 'erc20:totalSupply' }))
      } else {
        api.add(tokens, await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' }))
      }
    },
    staking: staking('0xFE4BCE4b3949c35fB17691D8b03c3caDBE2E5E23', '0x259338656198eC7A76c729514D3CB45Dfbf768A1'),
  }
}