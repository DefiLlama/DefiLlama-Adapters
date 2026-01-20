const { aaveExports } = require('../helper/aave')

module.exports = {
  hemi: aaveExports(
    'hemi',
    undefined,
    undefined,
    ['0x986b04d0a228b8cB81E236F9Add85e43758F21B2']
  ),
  hyperliquid: aaveExports(
    'hyperliquid',
    undefined,
    undefined,
    ['0x473f5e779b36DdC54f63107B255580Db049EFc5b']
  ),
}