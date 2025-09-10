const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

// thBill token address
THBILL_ETH = "0x5FA487BCa6158c64046B2813623e20755091DA0b"

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0xAECCa546baFB16735b273702632C8Cbb83509d8F', tokens: ['0x50293DD8889B931EB3441d2664dce8396640B419', ADDRESSES.ethereum.USDC,]})
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: '0xAECCa546baFB16735b273702632C8Cbb83509d8F', tokens: ['0xc26af85ede9cc25d449bcebef866bb85afd5d346', ]})
  },
}
