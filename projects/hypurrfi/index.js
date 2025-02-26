const { aaveExports, methodology } = require('../helper/aave')

module.exports = {
  methodology,
  hyperliquid: aaveExports(undefined, undefined, undefined, ["0x48684a2316eac7b458ad22c459e12eb1c0fa28c4"], { v3: true, }),
}