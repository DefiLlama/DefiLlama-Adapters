const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  timetravel: false,
  bsc: {
    tvl: sumTokensExport({ owner:'0xfc63831f1C517d196470F03a61afD3d0CC0f7127', tokens: [ADDRESSES.bsc.USDT] }) +
        sumTokensExport({ owner:'0x2212b7DAD2d85176602CaA64F2CBf4a24A6e0a06', tokens: [ADDRESSES.bsc.USDT] }) // ref system
  },
  ethereum: {
    tvl: sumTokensExport({ owner:'0xfc63831f1C517d196470F03a61afD3d0CC0f7127', tokens: [ADDRESSES.ethereum.USDT] })
  },
  ton: {
    tvl: sumTokensExport({ owner:'UQAdMVptN2z9YZi9XiaGhQMQiXzfsPaGWsmtYk9RF7VK4kIB', onlyWhitelistedTokens: true, tokens: [ADDRESSES.ton.USDT]})
  },
}; 