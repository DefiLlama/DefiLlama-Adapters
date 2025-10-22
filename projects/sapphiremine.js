const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokensExport } = require('./helper/unwrapLPs');

module.exports = {
  polygon: {
    tvl: sumTokensExport({ owner: '0x7146854856E3f373675105556c7D964B329606be', token: ADDRESSES.null}),
  }
};