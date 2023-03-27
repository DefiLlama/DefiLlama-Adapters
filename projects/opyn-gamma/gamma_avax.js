const { sumTokensExport } = require('../helper/unwrapLPs')

const marginPool = "0xCCF6629aEaB734E621Cc59EBb0297196774fDb9D";
const wavax = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'.toLowerCase()

module.exports = sumTokensExport({ owner: marginPool, tokens: [wavax]})
