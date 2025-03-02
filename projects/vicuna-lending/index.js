const { aaveExports, methodology } = require("../helper/aave")
const { mergeExports } = require("../helper/utils")

const dataProviders = ['0xc67850eCd0EC9dB4c0fD65C1Ad43a53025e6d54D']

module.exports = mergeExports(dataProviders.map(address => ({
  sonic: aaveExports(undefined, undefined, undefined, [address], { v3: true }),
})))

module.exports.methodology = methodology