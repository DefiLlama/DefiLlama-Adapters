const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  blast: {
    tvl: sumTokensExport({ owner: '0xa247CfF2a50dE0328a0A5bdD0C563Bd44b1a8af9', tokens: [ADDRESSES.blast.USDB, ]}),
  },
}
