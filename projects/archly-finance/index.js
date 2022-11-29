const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    telos:{
        tvl: getUniTVL({ factory: '0x39fdd4Fec9b41e9AcD339a7cf75250108D32906c', chain: 'telos', useDefaultCoreAssets: true }),
    }
}