const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.null, '0x9d259aa1ec7324c7433b89d2935b08c30f3154cb'],
        [ADDRESSES.ethereum.USDC, '0xd05909852ae07118857f9d071781671d12c0f36c'],

      ]
    })
  }
}