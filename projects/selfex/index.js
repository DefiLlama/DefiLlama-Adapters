const { getUniTVL } = require('../helper/unknownTokens')
const chains = ['kava']

const USDk = '0x472402d47da0587c1cf515dafbafc7bce6223106'
const KFT = "0xa0eeda2e3075092d66384fe8c91a1da4bca21788"
const kBRISE = '0xea616011e5ac9a5b91e22cac59b4ec6f562b83f9'

module.exports = {
  deadFrom: '2026-09-30',
  misrepresentedTokens: true,
};

chains.forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: '0x98a3567692Eb055fA1F05D616cad494DE9B05512', useDefaultCoreAssets: true, blacklistedTokens: [KFT, USDk, kBRISE] }) }
})
