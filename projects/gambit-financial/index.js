const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owner: '0xc73A8DcAc88498FD4b4B1b2AaA37b0a2614Ff67B', tokens: [
      ADDRESSES.bsc.BUSD,
      ADDRESSES.bsc.BTCB,
      ADDRESSES.bsc.ETH,
      ADDRESSES.bsc.WBNB,
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.USDT,
    ]})
  },
}
