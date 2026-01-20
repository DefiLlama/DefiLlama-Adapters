const { aaveExports } = require('../helper/aave')

module.exports = {
  mode: aaveExports("mode", "0x5C93B799D31d3d6a7C977f75FDB88d069565A55b"),
}
module.exports.mode.borrowed = () => ({})
module.exports.deadFrom = '2025-02-05'