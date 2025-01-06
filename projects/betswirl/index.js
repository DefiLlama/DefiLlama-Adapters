const { staking } = require('../helper/staking')
const { sumTokens2 } = require("../helper/unwrapLPs.js")

module.exports = {
  methodology: "TVL counts BETS tokens or 8020 LP deposited on the Staking contracts.",
  start: '2023-06-25',
  bsc: {
    staking: staking('0x20Df34eBe5dCB1082297A18BA8d387B55fB975a0', '0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'),
  },
  polygon: {
    staking: staking('0xA0D5F23dc9131597975afF96d293E5a7d0516665', '0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'),
  },
  avax: {
    staking: staking('0x9913EffA744B72385E537E092710072D21f8BC98', '0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'),
  },
  arbitrum: {
    staking: staking('0xA7Dd05a6CFC6e5238f04FD6E53D4eFa859B492e4', '0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'),
  },
  ethereum: {
    tvl: () => ({}),
    pool2: (api) => sumTokens2({ api, owners: ['0xaeaF7948C38973908fFA97c92F3384595d057135'], tokens: ['0x26cc136e9b8fd65466f193a8e5710661ed9a9827'] }),
  },
};
