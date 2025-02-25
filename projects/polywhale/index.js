const { masterchefExports, } = require('../helper/unknownTokens')

module.exports = masterchefExports({
  chain: 'polygon',
  masterchef: '0x34bc3D36845d8A7cA6964261FbD28737d0d6510f',
  nativeToken: '0x05089C9EBFFa4F0AcA269e32056b1b36B37ED71b'
})
module.exports.deadFrom = 1648765747