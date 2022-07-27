const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    cronos: {
      tvl: getUniTVL({
        chain: 'cronos',
        factory: '0x1Ed37E4323E429C3fBc28461c14A181CD20FC4E8',
        coreAssets: [
          '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23', // wcro
        ],
      }),
    }
}