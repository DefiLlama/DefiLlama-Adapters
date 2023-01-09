const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports={
    telos:{
        tvl: getUniTVL({ factory: '0x39fdd4Fec9b41e9AcD339a7cf75250108D32906c', chain: 'telos', useDefaultCoreAssets: true }),
        staking: staking("0x5680b3059b860d07A33B7A43d03D2E4dEdb226BB", "0xa84df7aFbcbCC1106834a5feD9453bd1219B1fb5", "telos"),
    }
}