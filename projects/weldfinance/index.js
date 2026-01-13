const { masterchefExports, } = require("../helper/unknownTokens")

const USDk = '0x472402d47da0587c1cf515dafbafc7bce6223106'
const kBRISE = '0xea616011e5ac9a5b91e22cac59b4ec6f562b83f9'
const KFT = "0xa0eeda2e3075092d66384fe8c91a1da4bca21788"

module.exports = masterchefExports({
  chain: 'kava',
  useDefaultCoreAssets: true,
  masterchef: '0xAbF3edbDf79dAfBBd9AaDBe2efEC078E557762D7',
  nativeToken: KFT,
  blacklistedTokens: [USDk, kBRISE],
})

module.exports.deadFrom = '2026-01-01'