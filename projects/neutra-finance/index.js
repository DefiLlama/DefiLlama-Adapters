const ADDRESSES = require('../helper/coreAssets.json')
const {
  sumTokensExport
} = require('../helper/unwrapLPs');

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owner: '0x6bfa4f1dfafeb9c37e4e8d436e1d0c5973e47e25',
      tokens: [ADDRESSES.arbitrum.fsGLP, ADDRESSES.optimism.DAI,],
    }),
  }
};