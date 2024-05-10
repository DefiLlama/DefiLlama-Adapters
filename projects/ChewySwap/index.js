const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  shibarium: {
    tvl: getUniTVL({ factory: "0xEDedDbde5ffA62545eDF97054edC11013ED72125", useDefaultCoreAssets: true,})
  },
  dogechain: {
    tvl: getUniTVL({ factory: "0x7C10a3b7EcD42dd7D79C0b9d58dDB812f92B574A", useDefaultCoreAssets: true,})
  }
}