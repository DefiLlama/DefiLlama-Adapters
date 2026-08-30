const { sumERC4626Vaults } = require('../helper/erc4626')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Historical GMX strategy calls are gas-heavy, so keep multicalls small.
const CHUNK_SIZE = 5

// User-facing vaults can share strategies or route through another strategy.
// Only terminal strategies are included so the same managed assets are counted once.
const terminalStrategies = {
  ethereum: [
    '0x833225309dA2267d637CC05788ad5E3B113e698E',
    '0xCF8EafC3b1d92801238faAdC22D2a7B83FB96C10',
    '0xf0B8904b2C1C122e47a5CCD6898feD7301282beB',
    '0x6155C331Aa73a9872B22871EB6D7516c6Fb52a69',
    '0x13acF63100DAB1935f698B7B08eAa311ce1dCAeA',
    '0x6EF41Dea92e3be6a5F3D5303F5eA0eF62382d2A6',
    '0x49A991e33B80d6c5F727242C778DbFeb606b6259',
  ],
  arbitrum: [
    '0xea7aaf1713348be6f3556d4b94a44ddff20f9e4b',
    '0x3163a647ff4c819b6286d2dbc8405a124c93eba6',
    '0x645c2712fda24a41ed61064054429e00cb4293bb',
    '0x84ab623036860d70382df2bfdfa79fc0e313ffe4',
    '0x3a7756916d72396cbee0b4bfb20c06685a2ed54a',
    '0x3b1ef6cca0672bb08df2c817b37dca22a69b005f',
    '0x748c04f19b35e1a7f3e01c5ca4a7cdc0e5652c37',
    '0x187478fcfe9ffd22b1a00d81d59e7b58042ef384',
    '0xb3881520f0ff13ddf910ad91d35d5c0a1c3d7e38',
    '0xadbb6ec1d07b0e9708451fd657e7812327ec6501',
    '0xaa38b9475d7a9ea7a2a2bada7e41d56c5db132b8',
    '0x0eca3aa20cd8179968ed259d579241aa7d56f153',
    '0xaad007b3e4fb25c73fa05b160f756e3ea7f41c40',
    '0x22fce714b98ba39fdd6a21ef6a09e4b2b1d4ca4c',
    '0xcb27538d7c2de02204172dda26b3fbbd29c7813e',
    '0x96cf061342bf05a32f7086a3f9837231feec36af',
    '0x87cab1a26f2e9d834be36311dd17619596c4c580',
    '0x6e1ac8d73bbb47a95aa49cb04819a70bb8a374ba',
    '0x2ba1101f9b493a0d39901e5c2e1e9ac64a017a75',
    '0x0ce1b4a31a5e60ca7fb26658388a54b1cf8f908d',
    '0x8f7969b96a88a6b7382921095655523bf415141d',
    '0x864fa4246254ea9136507426022c067eb6ec0f0d',
    '0x4581124613f145d6f3f07e7acfd46eaca97ca205',
    '0x8c2bb72f96df793a361cfd9fdec03e7dc020b59f',
    '0x5b933af326575bf39e00d0dfd272e3ef84fddbee',
    '0x78b01ff3bc9d2393dbfc880e3e50ec6e39c5fd56',
    '0xa43a52c0c7179ccdd52216999b240ca371bfaf18',
    '0xc3cfa2e9d3c6a876df2710c1accb800db1a5a5cd',
    '0xde062f280a73c2ee35da37200ed9b552ff261abf',
    '0x547b8ae8faacbe4077420b0fd94813c58b800462',
    '0xc8b7753b1e6307caec24938b319b3b03f2804579',
    '0xd77e220612f92f493172e23654b502d7f1f6b5c6',
    '0xf1d4847110aff666fd6c870341d3ecefe143838a',
    '0x0808d542c615e7dca4e5768237a4e555604a8af7',
    '0x7d71f0849a180a192dd2014230ce07c6635805b1',
  ],
}

module.exports = {
  start: '2023-10-02',
  doublecounted: true,
  misrepresentedTokens: true,
  methodology: 'TVL is the sum of totalAssets() across Fija Finance terminal strategy contracts on Ethereum and Arbitrum. User-facing vaults and intermediate wrapper strategies are excluded because multiple vaults can route into the same terminal strategy. Each strategy is reported in its accounting asset. These assets are deployed into external protocols including Curve, Convex, Aave, GMX, and Morpho, so this TVL is double-counted with those protocols.',
}

Object.entries(terminalStrategies).forEach(([chain, vaults]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      for (let i = 0; i < vaults.length; i += CHUNK_SIZE) {
        await sumERC4626Vaults({
          api,
          calls: vaults.slice(i, i + CHUNK_SIZE),
          isOG4626: true,
          permitFailure: true,
        })
      }
      return sumTokens2({ api })
    },
  }
})
