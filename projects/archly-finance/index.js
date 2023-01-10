const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')

module.exports={
    telos:{
        tvl: getUniTVL({ factory: '0x39fdd4Fec9b41e9AcD339a7cf75250108D32906c', chain: 'telos', useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            owner: '0x5680b3059b860d07A33B7A43d03D2E4dEdb226BB',
            tokens: ['0xa84df7aFbcbCC1106834a5feD9453bd1219B1fb5'],
            lps: ['0x34480A4C917caDbE41cb805f3e3baDb93bD9068C'],
            coreAssets: ['0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E'],
            restrictTokenRatio: 100,
        })
    }
}