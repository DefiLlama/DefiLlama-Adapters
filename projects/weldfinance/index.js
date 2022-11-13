const { masterchefExports, } = require("../helper/unknownTokens")

module.exports = masterchefExports({
  chain: 'kava',
  useDefaultCoreAssets: true,
  masterchef: '0xAbF3edbDf79dAfBBd9AaDBe2efEC078E557762D7',
  nativeToken: '0xa0EEDa2e3075092d66384fe8c91A1Da4bcA21788'
})