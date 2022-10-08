const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    cronos: {
      tvl: getUniTVL({
        chain: 'cronos',
        factory: '0x1Ed37E4323E429C3fBc28461c14A181CD20FC4E8',
        useDefaultCoreAssets: true,
      }),
    }
}