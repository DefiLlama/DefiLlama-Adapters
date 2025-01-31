const { aaveExports, methodology } = require('../helper/aave')

module.exports = {
  fraxtal: aaveExports(null, undefined, undefined, ['0xFB3adf4c845fD6352D24F3F0981eb7954401829c'], { v3: true, blacklistedTokens: ['0x788D96f655735f52c676A133f4dFC53cEC614d4A'] }),
  methodology,
}
