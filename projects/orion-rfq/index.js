const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  ethereum: '0xb5599f568D3f3e6113B286d010d2BCa40A7745AA',
  bsc: '0xe9d1D2a27458378Dd6C6F0b2c390807AEd2217Ca',
  fantom: '0x9dB0Af2fc2BB5144204533d3e0bc8Ed14C8C4923',
  polygon: '0x7B52881fA99c752cf8FbfD4904091d0FCCF7e71a',
}

const blacklistedTokens = {
  ethereum: ['0x0258F474786DdFd37ABCE6df6BBb1Dd5dfC4434a'],
  fantom: ['0xD2cDcB6BdEE6f78DE7988a6A60d13F6eF0b576D9'],
  polygon: ['0xD2cDcB6BdEE6f78DE7988a6A60d13F6eF0b576D9'],
}

Object.keys(config).forEach(chain => {
  const owner = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owner, fetchCoValentTokens: true, blacklistedTokens: blacklistedTokens[chain] })
  }
})
