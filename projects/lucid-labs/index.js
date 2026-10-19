const ADDRESSES = require('../helper/coreAssets.json')

// Asset Controllers hold the native tokens on each asset's base chain
// and mint/burn the Lucid-wrapped versions on the other chains.
// Source: https://docs.lucidlabs.fi/developer-reference/deployed-contracts/controller-contracts
const config = {
  arbitrum: [
    // L-USDC controller
    ['0xaf88d065e77c8cC2239327C5EDb3A432268e5831', '0x3c3DC44fABc3a516E6A329734aEE36dA49F3BA21'],
  ],
  optimism: [
    // L-USDT controller
    ['0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', '0x35Be3fa7e22B7FD7051248974cC44Bf88b8c5cc2'],
    // MANTRA USDT controller
    ['0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', '0x0569725992ee675f862bf0d25CA40fCfB2B69d6E'],
  ],
  avax: [
    // KiteAI USDC and WETH controllers
    ['0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', '0x7144ADe61f4BEcD513658db3441a0CE286aE90fd'],
    ['0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', '0x1324Be9339e1618387d2405C6f4CE660447cB582'],
  ],
  celo: [
    // KiteAI USDT controller
    ['0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e', '0xc620C68Cb63EA35e9930e240051A6A7C02D568A1'],
  ],
  base: [
    // MANTRA USDC and WETH controllers
    ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', '0xFf54162d7061290A966119784a0F34663d00E190'],
    ['0x4200000000000000000000000000000000000006', '0x47263861BD8E964425910FAA0870e9d0fb630876'],
  ],
  ethereum: [
    // RedBelly USDC.e, USDT, WETH, WBTC controllers
    ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x3b55a4C0691d4D62719D0BFaA435010fBF2F135f'],
    ['0xdAC17F958D2ee523a2206206994597C13D831ec7', '0x4f65f6e8B436289513b5F3ce96B2D2f032fc207C'],
    ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xc0FCe0c5cdbbA2D7f7212F3C726b05d5d1b6cf0E'],
    ['0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', '0x530d8C1fC48fa4b61Ac755be3bB3CbdCAcd20be9'],
  ],
}

module.exports = {
  start: '2026-05-19', // last controller deployed 2026-05-18
  doublecounted: true,
  methodology:
    'TVL is the native tokens locked in Lucid Asset Controller contracts on each asset\'s base chain, including the share each controller has deployed to its Aave V3 yield strategy (counted via the strategy\'s aToken balance). Wrapped Lucid tokens minted on other chains are not counted.',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const tokensAndOwners = [...config[chain]]
      const strategies = (await api.multiCall({ abi: 'address:yieldStrategy', calls: config[chain].map(([, owner]) => owner) }))
        .filter((s) => s !== ADDRESSES.null)
      const aTokens = await api.multiCall({ abi: 'address:aToken', calls: strategies })
      aTokens.forEach((aToken, i) => tokensAndOwners.push([aToken, strategies[i]]))
      return api.sumTokens({ tokensAndOwners })
    },
  }
})
