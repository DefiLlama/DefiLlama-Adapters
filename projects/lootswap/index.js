const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    harmony: {
        tvl: getUniTVL({ factory: '0x021AeF70c404aa9d70b71C615F17aB3a4038851A', useDefaultCoreAssets: true }),
    },
    hallmarks:[
        [1655991120, "Horizon bridge Hack $100m"],
      ],
}