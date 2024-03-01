const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  "clearinghouse": "0xC748532C202828969b2Ee68E0F8487E69cC1d800",
  "endpoint": "0x00F076FE36f2341A1054B16ae05FcE0C65180DeD",
}


module.exports = {
  blast: {
    tvl: sumTokensExport({
      owners: [config.clearinghouse, config.endpoint],
      tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH],
    })
  }
}