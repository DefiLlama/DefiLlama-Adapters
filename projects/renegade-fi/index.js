const { sumTokensExport } = require("../helper/unwrapLPs")

const config = {
  arbitrum: { owners: ['0x30bD8eAb29181F790D7e495786d4B96d7AfDC518']},
  base: { owners: ['0xb4a96068577141749CC8859f586fE29016C935dB']},
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain], fetchCoValentTokens: true})  
  }
})