const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const marginPool = "0xCCF6629aEaB734E621Cc59EBb0297196774fDb9D";
const wavax = ADDRESSES.avax.WAVAX.toLowerCase()

module.exports = sumTokensExport({ owner: marginPool, tokens: [wavax]})
