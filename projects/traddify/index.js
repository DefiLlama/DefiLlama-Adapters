const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xA7f3d2dEa7a53E7A9FEbBdE5Cf7C69d39D065030"

module.exports = {
  methodology: `We count the WKAVA on ${contract}`,
  kava: {
    tvl: sumTokensExport({ tokens: [nullAddress, '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b', ], owner: contract})
  }
}
