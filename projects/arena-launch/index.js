const { sumTokensExport, nullAddress, } = require('../helper/unwrapLPs')

module.exports = {
  avax: { tvl: sumTokensExport({ owner: '0x8315f1eb449Dd4B779495C3A0b05e5d194446c6e', tokens: [nullAddress,] }) }
}