const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  polygon: {
    tvl: sumTokensExport({
      blacklistedTokens: ['0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B'],
      owner: '0xFDBC53080AFb08d7a3A2420e902c8AeC05E4aE73',
      resolveUniV3: true
    })
  }
}