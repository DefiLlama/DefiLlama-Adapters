const ADDRESSES = require('../helper/coreAssets.json')
const USDT = ADDRESSES.bsc.USDT;
const UNIWHALE_LIQUIDITY_POOL = "0xBdeCAFd9096D43616a8E0eB8F3fa0865fD4769E7";
const UNIWHALE_MARGIN_POOL = "0xBB1B941aB76fAE4e9F552B860eFaC1F367AC9bCc";
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  start: '2023-03-03',
  bsc: {
    tvl: sumTokensExport({ owners: [UNIWHALE_LIQUIDITY_POOL, UNIWHALE_MARGIN_POOL, ], tokens: [USDT]}),
  },
};
