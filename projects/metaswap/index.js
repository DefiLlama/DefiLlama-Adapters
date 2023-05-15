const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  eos_evm: {
    tvl: getUniTVL({ factory: '0x589ca5Ab00443681e2eA427971BB1460823A36f9', useDefaultCoreAssets: true,  })
  }
}