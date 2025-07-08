const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xA7f3d2dEa7a53E7A9FEbBdE5Cf7C69d39D065030"

module.exports = {
  methodology: `We count the WKAVA on ${contract}`,
  kava: {
    tvl: sumTokensExport({ tokens: [nullAddress, ADDRESSES.kava.WKAVA, ], owner: contract})
  }
}
