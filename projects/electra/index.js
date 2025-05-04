const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

module.exports = {
  timetravel: false,
  bsc: {
    tvl: sdk.util.sumChainTvls([
        sumTokensExport({ owner:'0xfc63831f1C517d196470F03a61afD3d0CC0f7127', tokens: [ADDRESSES.bsc.USDT] }),
        sumTokensExport({ owner:'0xb220195156c590e6645b86e8e65a029979095463', tokens: [ADDRESSES.bsc.USDT] }) //cold wallet
      ])
  },
  ethereum: {
    tvl: sumTokensExport({ owner:'0xfc63831f1C517d196470F03a61afD3d0CC0f7127', tokens: [ADDRESSES.ethereum.USDT] })
  },
  ton: {
    tvl: sumTokensExport({ owner:'UQAdMVptN2z9YZi9XiaGhQMQiXzfsPaGWsmtYk9RF7VK4kIB', onlyWhitelistedTokens: true, tokens: [ADDRESSES.ton.USDT]})
  },
}; 