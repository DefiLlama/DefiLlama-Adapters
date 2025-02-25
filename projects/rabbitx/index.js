const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")
const { staking } = require('../helper/staking')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: ['0xFc7f884DE22a59c0009C91733196b012Aecb8F41', '0x3b8F6D6970a24A58b52374C539297ae02A3c4Ae4', '0x7fAb440A0251dA67B316d2c0431E3Ccf4520Cd42','0x1171651A1917C7DE22cF2047D1D7Cb9d97039811',], tokens: [ADDRESSES.ethereum.USDT]}),
    staking: staking('0x0c378FB17E87B180256a87e3f671cd83Bf3236DB', '0x3Ba925fdeAe6B46d0BB4d424D829982Cb2F7309e'),
  },
  blast: {
    tvl: sumTokensExport({ owners: ['0x3Ba925fdeAe6B46d0BB4d424D829982Cb2F7309e', '0x212f3a03b0e67f2d0afc7bca138707cf9fd6a0e6'], tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH]}),
    staking: staking('0x67dBA61709D78806395acDBa3EF9Df686aF5dc24', '0x236bb48fcF61ce996B2C8C196a9258c176100c7d'),
  },
  sonic: {
    tvl: sumTokensExport({ owners: ['0xaC63e55a9D6B331987072f98beDf216F51370E28'], tokens: [ADDRESSES.sonic.USDC_e]}),
  },
  base: {
    tvl: sumTokensExport({ owners: ['0x07607d79Bc28669bbF7ec6cfC7Ae68AA6964C762'], tokens: [ADDRESSES.base.USDC]}),
  },
  arbitrum: {
    tvl: sumTokensExport({ owners: ['0x2E89ECF3945fcBdA70770f59F3833aC7D08b83c0'], tokens: [ADDRESSES.arbitrum.USDC_CIRCLE]}),
  },
}
