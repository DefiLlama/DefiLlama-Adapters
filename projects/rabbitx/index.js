const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")
const { staking } = require('../helper/staking')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: ['0xFc7f884DE22a59c0009C91733196b012Aecb8F41', '0x3b8F6D6970a24A58b52374C539297ae02A3c4Ae4', '0x7fAb440A0251dA67B316d2c0431E3Ccf4520Cd42',], tokens: [ADDRESSES.ethereum.USDT]}),
    staking: staking('0x0c378FB17E87B180256a87e3f671cd83Bf3236DB', '0x3Ba925fdeAe6B46d0BB4d424D829982Cb2F7309e'),
  },
  blast: {
    tvl: sumTokensExport({ owner: '0x3Ba925fdeAe6B46d0BB4d424D829982Cb2F7309e', tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH]}),
    staking: staking('0x67dBA61709D78806395acDBa3EF9Df686aF5dc24', '0x236bb48fcF61ce996B2C8C196a9258c176100c7d'),
  },
}
