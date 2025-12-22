const { aaveExports, methodology } = require('../helper/aave')

module.exports = {
  saga: aaveExports(null, undefined, undefined, ['0x96a5A828c554b4D5ACdb9f0f4bb15b24C0423B69'], { v3: true, blacklistedTokens: ['0xB76144F87DF95816e8c55C240F874C554B4553C3'] }),
  methodology,
}
