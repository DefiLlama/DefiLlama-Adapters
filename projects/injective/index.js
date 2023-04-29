const { sumTokensExport } = require('../helper/unwrapLPs')

const newHolder = '0xf955c57f9ea9dc8781965feae0b6a2ace2bad6f3'
module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: newHolder, tokens: [
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0x6b175474e89094c44da98b954eedeac495271d0f',
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0x514910771af9ca656af840dff83e8264ecf986ca',
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0xaaef88cea01475125522e117bfe45cf32044e238',
        '0x4a220e6096b25eadb88358cb44068a3248254675',
        '0xde4c5a791913838027a2185709e98c5c6027ea63',
        '0x92d6c1e31e14520e676a687f0a93788b716beff5',
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        '0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b',
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
        '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
        '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
        '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
        '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
        '0xc944E90C64B2c07662A292be6244BDf05Cda44a7'
      ]
    })
  }
}
