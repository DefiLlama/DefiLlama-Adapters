const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0xAECCa546baFB16735b273702632C8Cbb83509d8F', tokens: ['0x50293DD8889B931EB3441d2664dce8396640B419', ADDRESSES.ethereum.USDC,]})
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: '0xAECCa546baFB16735b273702632C8Cbb83509d8F', tokens: ['0xc26af85ede9cc25d449bcebef866bb85afd5d346', ]})
  },
}
