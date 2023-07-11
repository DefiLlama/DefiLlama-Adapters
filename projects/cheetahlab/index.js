const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x22026DD175af8f12574602a89e02420eA8daF140"

module.exports = {
  methodology: `We count the WKAVA on ${contract}`,
  kava: {
    tvl: sumTokensExport({ tokens: [nullAddress, ADDRESSES.kava.WKAVA, ], owner: contract})
  }
}