const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const newHolder = '0xf955c57f9ea9dc8781965feae0b6a2ace2bad6f3'
module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: newHolder, tokens: [
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.LINK,
        ADDRESSES.ethereum.WBTC,
        '0xaaef88cea01475125522e117bfe45cf32044e238',
        '0x4a220e6096b25eadb88358cb44068a3248254675',
        '0xde4c5a791913838027a2185709e98c5c6027ea63',
        '0x92d6c1e31e14520e676a687f0a93788b716beff5',
        ADDRESSES.ethereum.UNI,
        '0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b',
        ADDRESSES.ethereum.STETH,
        '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
        ADDRESSES.ethereum.MATIC,
        ADDRESSES.ethereum.AAVE,
        ADDRESSES.ethereum.SNX,
        '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
        ADDRESSES.ethereum.SUSHI,
        '0xc944E90C64B2c07662A292be6244BDf05Cda44a7'
      ]
    })
  }
}
