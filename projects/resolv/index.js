const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

const tokens = [
  '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', // USR
  '0x4956b52aE2fF65D74CA2d61207523288e4528f96'  // RLP
]
  
  
const HACK_START = 1774137600    // 2026-03-25
const HACK_RESOLVED = 1776444059 // 2026-04-17 — hacked USR burned

module.exports = {
  methodology: 'Counts total supply of USR and RLP tokens.',
  hallmarks: [
    ["2026-03-21", "80M USR minted in hack, burned by Apr 16"],
  ],
  ethereum: {
    misrepresentedTokens: true,
    tvl: async (api) => {
      // USR mapped to USDC (1:1 stablecoin)
      api.add(ADDRESSES.ethereum.USDC, (await api.call({ target: tokens[0], abi: 'erc20:totalSupply' })) / 1e12)
      // Subtract 80M during hack window (hacked tokens burned Apr 17)
      if (api.timestamp > HACK_START && api.timestamp < HACK_RESOLVED) {
        api.add(ADDRESSES.ethereum.USDC, -8e13)
      }
      api.add(tokens[1], await api.call({ target: tokens[1], abi: 'erc20:totalSupply' }))
    },
    staking: staking('0xFE4BCE4b3949c35fB17691D8b03c3caDBE2E5E23', '0x259338656198eC7A76c729514D3CB45Dfbf768A1'),
  }
}