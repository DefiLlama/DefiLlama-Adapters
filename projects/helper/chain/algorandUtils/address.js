// Algorand address codec lives in @defillama/sdk (`sdk.chains.algorand`)
const { algorand } = require('@defillama/sdk').chains

module.exports = {
  encodeAddress: algorand.encodeAddress,
  getApplicationAddress: algorand.getApplicationAddress,
}
