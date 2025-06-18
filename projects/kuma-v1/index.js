const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const KUMA_BERACHAIN_OFT_ADAPTER_USDC = '0x7145855835924a9dFa80f42749E1FF96Eed26BC1';

module.exports = {
  berachain: {
    tvl: sumTokensExport({ owner: KUMA_BERACHAIN_OFT_ADAPTER_USDC, tokens: [ADDRESSES.berachain.USDC]}),
  }
}
