const ADDRESSES = require('../helper/coreAssets.json')

// Asset Controllers hold the native tokens on each asset's base chain
// and mint/burn the Lucid-wrapped versions on the other chains.
// Source: https://docs.lucidlabs.fi/developer-reference/deployed-contracts/controller-contracts
const config = {
  arbitrum: [
    // L-USDC controller
    [ADDRESSES.arbitrum.USDC_CIRCLE, '0x3c3DC44fABc3a516E6A329734aEE36dA49F3BA21'],
  ],
  optimism: [
    // L-USDT controller
    [ADDRESSES.optimism.USDT, '0x35Be3fa7e22B7FD7051248974cC44Bf88b8c5cc2'],
    // MANTRA USDT controller
    [ADDRESSES.optimism.USDT, '0x0569725992ee675f862bf0d25CA40fCfB2B69d6E'],
  ],
  avax: [
    // KiteAI USDC and WETH controllers
    [ADDRESSES.avax.USDC, '0x7144ADe61f4BEcD513658db3441a0CE286aE90fd'],
    [ADDRESSES.avax.WETH_e, '0x1324Be9339e1618387d2405C6f4CE660447cB582'],
  ],
  celo: [
    // KiteAI USDT controller
    [ADDRESSES.celo.USDT_1, '0xc620C68Cb63EA35e9930e240051A6A7C02D568A1'],
  ],
  base: [
    // MANTRA USDC and WETH controllers
    [ADDRESSES.base.USDC, '0xFf54162d7061290A966119784a0F34663d00E190'],
    [ADDRESSES.optimism.WETH_1, '0x47263861BD8E964425910FAA0870e9d0fb630876'],
  ],
  ethereum: [
    // RedBelly USDC.e, USDT, WETH, WBTC controllers
    [ADDRESSES.ethereum.USDC, '0x3b55a4C0691d4D62719D0BFaA435010fBF2F135f'],
    [ADDRESSES.ethereum.USDT, '0x4f65f6e8B436289513b5F3ce96B2D2f032fc207C'],
    [ADDRESSES.ethereum.WETH, '0xc0FCe0c5cdbbA2D7f7212F3C726b05d5d1b6cf0E'],
    [ADDRESSES.ethereum.WBTC, '0x530d8C1fC48fa4b61Ac755be3bB3CbdCAcd20be9'],
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
