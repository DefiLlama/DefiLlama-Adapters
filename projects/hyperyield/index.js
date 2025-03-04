const { aaveExports, methodology } = require('../helper/aave')

module.exports = {
  methodology,
  hyperliquid: aaveExports(undefined, undefined, undefined, ["0x022F164dDBa35a994ad0f001705e9c187156E244"], { v3: true, }),
}
