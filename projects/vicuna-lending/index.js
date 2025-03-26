const { aaveExports, methodology } = require("../helper/aave")
const { mergeExports } = require("../helper/utils")

const dataProviders = [
  '0xc67850eCd0EC9dB4c0fD65C1Ad43a53025e6d54D',  // Main market
  '0xe78536507675de30D375C6d2B5dA1a99819Ea9fa',  // New data provider stable market
  '0x94e8122dF227B34998Ba7523ad88c943191cF4F1'   // New data provider sonic market
]

module.exports = mergeExports(dataProviders.map(address => ({
  sonic: aaveExports(undefined, undefined, undefined, [address], { v3: true }),
})))

module.exports.methodology = methodology
