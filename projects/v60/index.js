const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    prom: {
        tvl: getUniTVL({
            useDefaultCoreAssets: true,
            factory: '0x3B73a7eDc9dfE4847a20BcCfEf6Eb1c90439f5C9',
        })
    }
}