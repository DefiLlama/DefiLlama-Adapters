const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

const tokens = [
  '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', // USR
  '0x4956b52aE2fF65D74CA2d61207523288e4528f96'  // RLP
]
  
  
const HACK_START = 1774137600    // 2026-03-21
// https://etherscan.io/tx/0x41b6b9376d174165cbd54ba576c8f6675ff966f17609a7b80d27d8652db1f18f
// https://etherscan.io/tx/0xfe37f25efd67d0a4da4afe48509b258df48757b97810b28ce4c649658dc33743

const HACK_RESOLVED = 1776444059 // 2026-04-17 — hacked USR burned
// https://etherscan.io/tx/0x0498bf5b5a2e16e5cf5abccf3f8e00e14c93d785389de5bc44b3a6ec8ac346df

module.exports = {
  methodology: 'Counts total supply of USR and RLP tokens, excluding 80M USR during hack window.',
  hallmarks: [
    ["2026-03-21", "80M USR minted in hack"],
  ],
  ethereum: {
    misrepresentedTokens: true,
    tvl: async (api) => {
      if (api.timestamp < HACK_START) {
        api.add(tokens, await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' }))
      } else {
        // After hack we map USR to USDC and subtract 80M during hack window
        api.add(ADDRESSES.ethereum.USDC, (await api.call({ target: tokens[0], abi: 'erc20:totalSupply' })) / 1e12)
        if (api.timestamp < HACK_RESOLVED) api.add(ADDRESSES.ethereum.USDC, -8e13)
        api.add(tokens[1], await api.call({ target: tokens[1], abi: 'erc20:totalSupply' }))
      }
    },
    staking: staking('0xFE4BCE4b3949c35fB17691D8b03c3caDBE2E5E23', '0x259338656198eC7A76c729514D3CB45Dfbf768A1'),
  }
}
