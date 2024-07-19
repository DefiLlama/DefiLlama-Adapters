const { stakings } = require("../helper/staking");
const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')

const getReserves = 'function getReserves() view returns (uint256 _reserve0, uint256 _reserve1)'
const stakingAddresses = [
  "0x1d37f1e6f0cce814f367d2765ebad5448e59b91b",
  "0x1aBd0067f60513F152ff14E9cD26a62c820d022C",
  "0xfc652ea2e8a373c16f3d8c5bd25e9898b9699ecb"
]
const idia = "0x0b15ddf19d47e6a86a56148fb4afffc6929bcb89"
module.exports = {
  misrepresentedTokens: true,
}

const config = {
  bsc: {
    factories: ['0x918d7e714243F7d9d463C37e106235dCde294ffC',],
    factoriesWithDiffABI: ['0x4233ad9b8b7c1ccf0818907908a7f0796a3df85f'],
  },
  boba: { factoriesWithDiffABI: ['0x7cF0a21D61Bb9215e44ACbA69442dE68ceb2C00D'], },
  aurora: { factoriesWithDiffABI: ['0x45a3a315277Fbc1BCe0611c4398b32E0317Fd7c1'], },
  moonbeam: { factoriesWithDiffABI: ['0x45603612891b6406A06854813e18443fC8ec7C73'], },
  avax: { factoriesWithDiffABI: ['0x45603612891b6406A06854813e18443fC8ec7C73'], },
  kava: { factoriesWithDiffABI: ['0xE2da68886db83cb1b4A9878F1EfA6843f539df69']},
  okexchain: { factoriesWithDiffABI: ['0x2CA5708568003aBa525bFe32C7D6D149D384D874'], },
};

Object.keys(config).forEach(chain => {
  const { factories = [], factoriesWithDiffABI = [] } = config[chain]
  const exports = [
    ...factoriesWithDiffABI.map(factory => getUniTVL({ chain, factory, useDefaultCoreAssets: false, abis: { getReserves } })),
    ...factories.map(factory => getUniTVL({ chain, factory, useDefaultCoreAssets: false })),
  ]
  module.exports[chain] = {
    tvl: sdk.util.sumChainTvls(exports)
  }
})

module.exports.bsc.staking = stakings(stakingAddresses, idia)
