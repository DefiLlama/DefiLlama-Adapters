const { masterchefExports } = require("../helper/unknownTokens");

module.exports = masterchefExports({ 
  chain: 'pulse', 
  masterchef: '0x86dd9C95E9d504648d40732c925438C6984Fac4A',
  nativeTokens: ['0x303f764A9c9511c12837cD2D1ECF13d4a6F99E17'],
  useDefaultCoreAssets: true,
})