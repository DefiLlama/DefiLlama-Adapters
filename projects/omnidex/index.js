const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    misrepresentedTokens: true,
    telos:{
        tvl: getUniTVL({ factory: '0x7a2A35706f5d1CeE2faa8A254dd6F6D7d7Becc25', useDefaultCoreAssets: true }),
    }
}