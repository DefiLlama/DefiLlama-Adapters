const { nullAddress, sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  ethereum: '0xA875755b23a38E06B669219AFf9bb79845F43EFd',
  base: '0xE173A25C522385BB117b3044C79F534cD0a895EC'
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: config.ethereum, fetchCoValentTokens: true })
  },
  base: {
    tvl: sumTokensExport({ owner: config.base, tokens: [nullAddress] })
  }
}
