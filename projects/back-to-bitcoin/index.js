const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const contract = "0x1EE28d16C380B2137E63EBf92a9F5B42e63E9500"

module.exports = {
  methodology: `We count the BTCB on ${contract}`,
  bsc: {
    tvl: sumTokensExport({ owner: contract, tokens: [ADDRESSES.bsc.BTCB]}),
  }
}
