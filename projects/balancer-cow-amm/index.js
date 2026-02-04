const { v1Tvl } = require('../helper/balancer')
const sdk = require('@defillama/sdk')

const config = {
  ethereum: [
    ['0xf76c421bAb7df8548604E60deCCcE50477C10462', 20432455],
    ['0x23fcC2166F991B8946D195de53745E1b804C91B7', 20391510],
  ],
  xdai: [
    ['0x703Bd8115E6F21a37BB5Df97f78614ca72Ad7624', 35259725],
    ['0x7573B99BC09c11Dc0427fb9c6662bc603E008304', 35163914],
  ],
  arbitrum: [
    ['0xE0e2Ba143EE5268DA87D529949a2521115987302', 248291297]
  ],
  base: [
    ['0x03362f847B4fAbC12e1Ce98b6b59F94401E4588e', 	23650208]
  ]
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sdk.util.sumChainTvls(config[chain].map(c => v1Tvl(...c)))
  }
})