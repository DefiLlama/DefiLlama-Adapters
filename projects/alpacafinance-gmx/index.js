const ADDRESSES = require('../helper/coreAssets.json')
const { gmxExports } = require('../helper/gmx')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  bsc:{
    tvl: sumTokensExport({
      owner: '0x18A15bF2Aa1E514dc660Cc4B08d05f9f6f0FdC4e',
      tokens: [
        ADDRESSES.bsc.USDC,
        ADDRESSES.bsc.USDT,
        ADDRESSES.bsc.ETH,
        ADDRESSES.bsc.BTCB,
        ADDRESSES.bsc.WBNB,
      ],
    })
  }
};
