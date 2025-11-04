const { aaveExports } = require('../helper/aave')

module.exports = {
  hemi: aaveExports(
    'hemi',
    undefined,
    undefined,
    ['0x986b04d0a228b8cB81E236F9Add85e43758F21B2']
  ),
}