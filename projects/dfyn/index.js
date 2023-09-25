const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  polygon:{
    tvl: getUniTVL({
      factory: '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B',
      useDefaultCoreAssets: true,
    }),
  },
  okexchain:{
    tvl: getUniTVL({
      factory: '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B',
      useDefaultCoreAssets: true,
    }),
  },
  fantom:{
    tvl: getUniTVL({
      factory: '0xd9820a17053d6314B20642E465a84Bf01a3D64f5',
      useDefaultCoreAssets: true,
    }),
  },
}
